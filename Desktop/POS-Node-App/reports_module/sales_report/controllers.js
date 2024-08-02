import prisma from '../../db_client/prisma_client.js';

export const totalSalesReport = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const totalSales = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{totalPrice:true}
        })
        res.json(totalSales);    
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}


export const salesReportByProduct = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const salesByProduct = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{quantity:true, totalPrice:true},
        })
        res.json(salesByProduct);
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const salesReportByDate = async(req,res)=>{  
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
        const salesByDate  = await prisma.sale.findMany({ 
            where:{ 
                shopId,
                saleDate:{ 
                    gte: start,
                    lte: end,
                }
            },
            include: { saleItems: true },

            // where: {
            //     shopId,
            //     date: {
            //       gte: start,
            //       lte: end,
            //     },
            //   },
            //   include: { saleItems: { include: { product: true } } },

        })
        const totalProfit = salesByDate.reduce((acc, sale) => acc + sale.profit, 0);
        res.json({ totalProfit, salesByDate })
    } catch (error) {
        if (error.message === 'Invalid date format') {
            return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
    
}