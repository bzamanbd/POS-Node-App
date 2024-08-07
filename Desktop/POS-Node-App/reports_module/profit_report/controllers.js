import prisma from '../../db_client/prisma_client.js';
import appErr from '../../utils/appErr.js';

export const totalProfit = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const totalProfit = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{profit: true},
        })
        res.status(200).json({
            message:'The Total Profit',
            totalProfit
        });    
    } catch (e) {
        return next(e.message,500)
    }
    
}

export const profitByProduct = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const profitByProduct = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{profit: true,quantity: true},
        })
      
        res.json({ message:'Product base profit',profitByProduct});
    } catch (e) {
        return next(e.message,500)
    }
    
}

export const profitByDate = async(req,res,next)=>{  
    const { startDate, endDate } = req.query;
    const shopId = req.shopOwner.shopId
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!startDate || !endDate) return next(appErr('startDate and endDate query parameters are required',400))
   
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
        const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
        res.status(200).json({
            message:`Profit from ${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()} to ${end.getDate()}-${end.getMonth()+1}-${start.getFullYear()}`, 
            totalProfit, 
            sales
        })
    } catch (e) {
        if (e.message === 'Invalid date format') {
            return next('Invalid date format. Please use YYYY-MM-DD format.',400)
        } else {
            return next(e.message,500)
        }
    }
    
}