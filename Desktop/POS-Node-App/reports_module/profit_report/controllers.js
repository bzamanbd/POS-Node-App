import prisma from '../../db_client/prisma_client.js';

export const totalProfit = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const profitByProduct = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const profitByProduct = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{profit: true,quantity: true},
        })
      
        res.json({ message:'Product base profit',profitByProduct});
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const profitByDate = async(req,res)=>{  
    const { startDate, endDate } = req.query;
    const shopId = req.salesman.shopId
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
      }

    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid date format');
      }

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
    } catch (error) {
        if (error.message === 'Invalid date format') {
            return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
    
}