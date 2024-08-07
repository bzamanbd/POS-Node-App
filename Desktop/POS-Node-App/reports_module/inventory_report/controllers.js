import prisma from '../../db_client/prisma_client.js';
import appErr from '../../utils/appErr.js';

export const currentInventory = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const inventory = await prisma.product.findMany({ 
            where:{shopId}, 
            select:{
                id:true,
                name:true,
                quantity:true,
                // category:{select:{name:true}},
                // shop:{select:{shopName:true,shopAddress:true}}
            }
        });
        if (inventory.length <1) {
            return res.status(200).json({message:'No Product Found', inventory});    
        }
        res.status(200).json({message:'Current Inventory', inventory});    
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}


export const lowStock= async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
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
                // category:{select:{name:true}},
                // shop:{select:{shopName:true,shopAddress:true}}
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
        return next(e.message,500)
    }
    
}
