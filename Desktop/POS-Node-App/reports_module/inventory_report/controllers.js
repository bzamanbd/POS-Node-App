import prisma from '../../db_client/prisma_client.js';

export const currentInventory = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const inventory = await prisma.product.findMany({ 
            where:{shopId}, 
            select:{
                id:true,
                name:true,
                quantity:true,
                category:{select:{name:true}},
                shop:{select:{shopName:true,shopAddress:true}}
            }
        });
        if (inventory.length <1) {
            return res.status(200).json({message:'No Product Found', inventory});    
        }
        res.status(200).json({message:'Current Inventory', inventory});    
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}


export const lowStock= async(req,res)=>{  
    const shopId = req.salesman.shopId
    const lowStockThreshold = 10

    try {
        const lowStockProducts = await prisma.product.findMany({
            where:{
                shopId,
                quantity:{ lt: lowStockThreshold}
            },
            select:{
                id:true,
                name:true,
                quantity:true,
                category:{select:{name:true}},
                shop:{select:{shopName:true,shopAddress:true}}
            }
        })
        if (lowStockProducts.length <1) {
            return res.status(200).json({message:' No Low-Stock Product Found ',lowStockProducts})
        }
        res.status(200).json({
            message:` ${lowStockProducts.length} Low-Stock Product Found `,
            lowStockProducts
        });
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}
