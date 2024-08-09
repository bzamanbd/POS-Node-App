import prisma from '../../db_client/prisma_client.js';
import appErr from '../../utils/appErr.js';
import appRes from '../../utils/appRes.js';

export const totalProfit = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    
    if(!shopId) return next(appErr('shopId is required',400))

    try {
        const totalProfit = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{profit: true},
        })
        appRes(res,200,'','The total profit',{totalProfit})

    } catch (e) {
        return next(e.message,500)
    }
    
}

export const profitByProduct = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    if(!shopId) return next(appErr('shopId is required',400))
    try {
        const profitByProduct = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{profit: true,quantity: true},
        })
        appRes(res,200,'','Product base profit',{profitByProduct})
        // res.json({ message:'Product base profit',profitByProduct});
    } catch (e) {
        return next(e.message,500)
    }
    
}

export const profitByDate = async(req,res,next)=>{  
    const { startDate, endDate } = req.query;
    const shopId = req.shopOwner.shopId
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!shopId || !startDate || !endDate) return next(appErr('shopId, startDate and endDate are required',400))
   
    if (isNaN(start) || isNaN(end)) return next(appErr('Invalid date format',400))
       
    try {
        const sales  = await prisma.sale.findMany({ 
            where:{ 
                shopId,
                saleDate:{ 
                    gte: start,
                    lte: end,
                }
            },
            // include: {saleItems: { select:{id:true,quantity:true,productId:true}}},
                     
        }) 
        if(!sales) return appRes(res,404,'False','Sales not found',{sales})
        const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
        appRes(res,200,'',`Profit from ${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()} to ${end.getDate()}-${end.getMonth()+1}-${start.getFullYear()}`,{totalProfit,sales})

    } catch (e) {
        if (e.message === 'Invalid date format') {
            return next('Invalid date format. Please use YYYY-MM-DD format.',400)
        } else {
            return next(e.message,500)
        }
    }
    
}