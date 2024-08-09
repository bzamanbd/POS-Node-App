import prisma from '../../db_client/prisma_client.js';
import appErr from '../../utils/appErr.js';
import appRes from '../../utils/appRes.js';

export const currentInventory = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    if(!shopId) return next(appErr('shopId is required',400))
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
        if (inventory.length <1) return appRes(res,404,'False','No product found!',{inventory})
        appRes(res,200,'',`${inventory.length} product found`,{inventory})
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const lowStock= async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    const lowStockThreshold = 10

    if(!shopId || !lowStockThreshold) return next(appErr('shopId and low stock threshold are required',400))

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
        if (lowStockProducts.length <1) return appRes(res,404,'False','No low-stock product found',{lowStockProducts})

        appRes(res,200,'',`${lowStockProducts.length} Low-Stock Product Found`, {lowStockProducts} )

    } catch (e) {
        return next(e.message,500)
    }
    
}
