import prisma from "../db_client/prisma_client.js"
import appErr from '../utils/appErr.js'
import appRes from '../utils/appRes.js'
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid';
import { generateBarcode } from '../utils/barcode_generator.js'
import { generateSKU } from '../utils/sku_generator.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const signin = async(req,res,next)=>{ 
    const {email,password} = req.body
    if (!email || !password) return next(appErr('email and password is required',400))
    try {
        const shopOwner = await prisma.shopOwner.findUnique({ where:{email}})
        if (shopOwner && bcrypt.compare(password, shopOwner.password)) {
            const tocken = jwt.sign({id:shopOwner.id, email:shopOwner.email},process.env.JWT_SECRET,{expiresIn: '1h'}) 
            appRes(res,200,'', 'Login success!', {tocken})
        }
        return next(appErr('wrong credential!',400))        
    } catch (e) {
        return next(appErr(e.message,500))
    } 

}

export const createCategory = async(req, res,next)=>{ 
    const {name} = req.body 
    const shopId = req.shopOwner.id
    if(!name || !shopId)return next(appErr('name and shopId is required',400))
    try { 
        const oldCategory = await prisma.category.findUnique({where:{name}})
        if (oldCategory)return next(appErr(`${oldCategory.name} is already exist`,409))
        const category = await prisma.category.create({data:{ shopId,name }})
        appRes(res,201,'',`${category.name} is created`,{category})
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const createProduct = async(req, res,next)=>{ 
    const {name, description, salePrice,costPrice,quantity,categoryId,variants } = req.body 
    const barcodeText = uuidv4();
    const barcode = generateBarcode(barcodeText)
    const shopId = req.shopOwner.shopId 

    if(!name || !salePrice || !costPrice || !quantity || !categoryId || !variants || !barcode || !shopId) return next(appErr('name,salePrice,costPrice,quantity,categoryId,variants,barcode,shopId are required',400))

    try {
        const oldProduct = await prisma.product.findUnique({where:{name}})
        if (!shopId) return next(appErr("Unauthorized. Please login as shop-owner to create ",401))
            
        if (oldProduct) return next(appErr(`${oldProduct.name} already exist. Please try another`,409))
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
        appRes(res,201,'','product is created', {product})
        } catch (e) {
            return next(appErr(e.message,500))
        }

    }

export const createSalesMan = async(req, res,next)=>{ 
    const {name,email,password} = req.body
    const shopId = req.shopOwner.shopId
    if(!name || !email|| !password || !shopId)return next(appErr('name,email,password and shopId are required',400))

    const hashedPass = await bcrypt.hash(password, 10) 

    try { 
        const oldSalesMan = await prisma.salesman.findUnique({where:{email}})

        if (oldSalesMan)return next(appErr('Email is already used',409))
        
        const salesMan = await prisma.salesman.create({ 
            data:{ shopId,name,email,password:hashedPass }
        })
        salesMan.password = undefined
        appRes(res,201,'','SalesMan is registered',{salesMan})

    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchCategories = async(req, res,next)=>{ 
    
    const shopId = req.shopOwner.shopId

    if(!shopId)return next(appErr('shopId is required',400))

    try { 
        const categories = await prisma.category.findMany({where:{shopId}})
    
        if (categories.length <1) return appRes(res,404,'False','No category found',{categories})
        
        appRes(res,200,'',`${categories.length} category found`,{categories})
        
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchProducts = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    if(!shopId)return next(appErr('shopId is required',400))
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
        if (products.length <1) appRes(res,200,'False','no product available',{products}) 
        
        appRes(res,200,'',`${products.length} product found`,{products})
        
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const fetchSalesMen = async(req, res,next)=>{ 
    const shopId = req.shopOwner.shopId
    if(!shopId)return next(appErr('shopId is required',400))
    try { 
        const salesMen = await prisma.salesman.findMany({where:{shopId}})
        
        if (!salesMen) return next(appErr('No SalesMen available',404))

            appRes(res,200,'',`${salesMen.length} SalesMan found`,{salesMen})

    } catch (e) {
        return next(appErr(e.message,500))
    }
}


export const fetchSales = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    if(!shopId)return next(appErr('shopId is required',400))
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
        if (sales.length <1)return appRes(res,404,'False','No sales found!',{sales})
        appRes(res,200,'',`${sales.length} sales available`,{sales})
    } catch (e) {
       return next(appErr(e.message,500))
    }
    
}


