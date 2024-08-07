import prisma from "../db_client/prisma_client.js"
import appErr from '../utils/appErr.js'
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid';
import { generateBarcode } from '../utils/barcode_generator.js'
import { generateSKU } from '../utils/sku_generator.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const signin = async(req,res,next)=>{ 
    const {email,password} = req.body
    try {
        const shopOwner = await prisma.shopOwner.findUnique({ where:{email}})
        if (shopOwner && bcrypt.compare(password, shopOwner.password)) {
            const tocken = jwt.sign({id:shopOwner.id, email:shopOwner.email},process.env.JWT_SECRET,{expiresIn: '1h'}) 
            return res.status(200).json({ 
                message:"Login success!", 
                tocken
            })
        }
        return next(appErr('user credential is wrong!',400))        
    } catch (e) {
        return next(appErr(e.message,500))
    } 

}

export const createCategory = async(req, res,next)=>{ 
    const {name} = req.body 
    const shopId = req.shopOwner.id
    try { 
        const oldCategory = await prisma.category.findUnique({where:{name}})
        if (oldCategory)return next(appErr(`${oldCategory} is already available`,401))
        const category = await prisma.category.create({data:{ shopId,name }})
        res.status(201).json({
            success:`${category.name} is created`,
            category
        })

    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const createProduct = async(req, res,next)=>{ 
    const {name, description, salePrice,costPrice,quantity,categoryId,variants } = req.body 
    const barcodeText = uuidv4();
    const barcode = generateBarcode(barcodeText)
    const shopId = req.shopOwner.shopId
    try {
        const oldProduct = await prisma.product.findUnique({where:{name}})
        if (!shopId) return next(appErr("Unauthorized. Please login as shop-owner to create ",401))
            
        if (oldProduct) return next(appErr(`${oldProduct.name} already exist. Please try another`,401))
        const product = await prisma.product.create({ 
            data:{ 
                name,
                description,
                barcode: barcodeText,
                salePrice,
                costPrice,
                quantity,
                variants:{
                    create:variants.map(variant=>({ 
                        sku:generateSKU(),
                        salePrice:variant.salePrice,
                        costPrice:variant.costPrice,
                        stock:variant.stock,
                        attributes:variant.attributes,
                    }))
                },
                shop: { connect: { id: shopId } },
                category: { connect: { id: categoryId } },
            },
            include: { variants: true }
        })
          res.status(201).json({success:'product is created', product});
        } catch (e) {
            return next(appErr(e.message,500))
        }

    }

export const createSalesMan = async(req, res,next)=>{ 
    const {name,email,password} = req.body
    const shopId = req.shopOwner.shopId
    const hashedPass = await bcrypt.hash(password, 10) 

    try { 
        const oldSalesMan = await prisma.salesman.findUnique({where:{email}})

        if (oldSalesMan)return next(appErr('Email is already used',409))
        
        const salesMan = await prisma.salesman.create({ 
            data:{ shopId,name,email,password:hashedPass }
        })

        res.status(201).json({
            success:'SalesMan is registered',
            salesMan
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const createSale = async (req,res,next)=>{
    const {saleItems} = req.body 
    const shopId = req.shopOwner.shopId
    const salesmanId = req.shopOwner.id
    
    try {
      const sale = await prisma.sale.create({
        data: {
          shop: { connect: { id: parseInt(shopId) } },
          salesman: { connect: { id: parseInt(salesmanId) } },
          saleItems: {
            create: saleItems.map(item => ({
              ...item,
              shopId: parseInt(shopId) 
            }))
          }
        },
        include: {
          saleItems: true
        }
      });
  
      // Calculate profit and total price for each sale item
      for (const item of sale.saleItems) {
        await prisma.calculateSaleItemProfitAndUpdateProduct(item.id);
      }
  
      // Calculate the total price and profit of the sale
      await prisma.calculateSaleTotalPriceAndProfit(sale.id);

      // Fetch the updated sale with sale items
      const finalSale = await prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          saleItems: true,
        },
    });
  
      res.status(201).json({
        success:'sale is created',
        finalSale
      });

    } catch (e) {
      return next(appErr(e.message,500))
    }

}

export const fetchCategories = async(req, res,next)=>{ 
    
    const shopId = req.shopOwner.shopId

    try { 
        const categories = await prisma.category.findMany({where:{shopId}})
    
        if (!categories) return next(appErr('No category found', 404))
            
        res.status(200).json({ 
            message:`${categories.length} category found`,
            categories
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchProducts = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const products  = await prisma.product.findMany({ 
            where:{
                shopId,
            },
            select:{ 
                id:true,
                name:true,
                description:true,
                salePrice:true,
                costPrice:true,
                quantity:true,
                category:{select:{name:true}},
                shop:{select:{shopName:true,shopAddress:true,shopPhone:true}},
                createdAt:true,
                updatedAt:true
            }
        })
        if (products.length <1) {
            return res.status(200).json({ 
                message:'no product available. please create a product',
                products
            })
        }
        
        return res.status(200).json({ 
            message:`${products.length} product found`,
            products
        })
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const fetchSalesMen = async(req, res,next)=>{ 
    const shopId = req.shopOwner.shopId
    try { 
        const salesMen = await prisma.salesman.findMany({where:{shopId}})
        if (!salesMen) return next(appErr('No SalesMen available',404))
        res.status(200).json({ 
            message:`${salesMen.length} SalesMan found`,
            salesMen
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}


export const fetchSales = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const sales  = await prisma.sale.findMany({ 
            where:{
                shopId,
            },
             select:{ 
                id:true,
                totalPrice: true,
                profit:true,
                shop:{select:{ id:true, shopName:true, shopAddress:true, shopPhone:true }},
                salesman:{select:{ id:true, shopId:true, name:true }},
                saleItems:{select:{
                  id: true,
                  saleId:true,
                  quantity: true,
                  totalPrice: true,
                  profit: true,
                  product:{select:{
                    id:true,
                    shopId:true,
                    name:true,
                    description:true,
                    category:{select:{name:true}},
                  }}
                }},
                saleDate: true,
             },
        })
        if (sales.length <1) {
          return res.status(200).json({ 
            message:'no sales available. please create a sale',
            sales
          })
        }
        return res.status(200).json({
          message:`${sales.length} sales available`,
          sales
        })
    } catch (e) {
       return next(appErr(e.message,500))
    }
    
}


