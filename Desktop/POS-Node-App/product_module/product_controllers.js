import prisma from "../db_client/prisma_client.js"
import { v4 as uuidv4 } from 'uuid';
import { generateBarcode } from '../utils/barcode_generator.js'
import { generateSKU } from '../utils/sku_generator.js'

export const createProduct = async (req,res)=>{
    const {name, description, salePrice,costPrice, quantity, categoryId,variants } = req.body 
    const barcodeText = uuidv4();
    const barcode = generateBarcode(barcodeText)
    const shopId = req.salesman.shopId
    try {
        const oldProduct = await prisma.product.findUnique({where:{name}})
        if (!shopId) {
            return res.status(401).status({ 
                message:"Authorization Required. Please login to create post"
            })
        }
        if (oldProduct) {
            return res.status(409).json({ 
                message:"This Product already exist. Please try another name"
            })
        }
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
        } catch (err) {
          res.status(400).json({ error: err.message });
        }
      };

export const fetchProducts = async(req,res)=>{  
    const shopId = req.salesman.shopId
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



export const getProductBarcode = async(req,res)=>{  
    const shopId = req.salesman.shopId
    const { id } = req.params;
    try {
        const product  = await prisma.product.findUnique({ 
            where:{shopId,id:parseInt(id)}
        })
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const barcodeImage = generateBarcode(product.barcode);

        // res.status(200).send(`<img src="${barcodeImage}" />`);

        let html = '<!DOCTYPE html><html><head><title>Barcode Copies</title></head><body>';
        for (let i = 0; i < 50; i++) {
          html += `<img src="${barcodeImage}" alt="Barcode Image" /><br />`;
        }
        html += '</body></html>';
        res.status(200).send(html);

    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}
