import prisma from "../db_client/prisma_client.js"

export const createProduct = async (req,res)=>{
    const {name, description, salePrice,costPrice, quantity, categoryId } = req.body 
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
                salePrice,
                costPrice,
                quantity,
                shop: { connect: { id: shopId } },
                category: { connect: { id: categoryId } },
            }
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
