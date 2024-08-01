import prisma from "../db_client/prisma_client.js"

export const createCategories = async (req,res)=>{
    const {name} = req.body 
    const shopId = req.salesman.shopId
    try {
        const oldCategory = await prisma.category.findUnique({where:{name}})
        if (!shopId) {
            return res.status(401).status({ 
                message:"Authorization Required. Please login to create post"
            })
        }
        if (oldCategory) {
            return res.status(409).json({ 
                message:"This Category already exist. Please try another name"
            })
        }
        
        const category = await prisma.category.create({ 
            data:{ 
                name,
                shopId,
            }
        })
          res.status(201).json({success:'Category is created', category});
        } catch (err) {
          res.status(400).json({ error: err.message });
        }
      };

export const fetchCategories = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const categories  = await prisma.category.findMany({ 
            where:{
                shopId,
            },
            select:{ 
                id:true,
                name:true,
                shop:{select:{id:true, shopName:true, shopAddress:true,shopPhone:true}},
                products:{select:{id:true,name:true,description:true}},
                createdAt:true,
                updatedAt:true,
            }
        })
        if (categories.length <1) {
            return res.status(200).json({ 
                message: 'No category found. Please create a category',
                categories
            })
        }
        return res.status(200).json({
            message:`${categories.length} category found`,
            categories
        })
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}