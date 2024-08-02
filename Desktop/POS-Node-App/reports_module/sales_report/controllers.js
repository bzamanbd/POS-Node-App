import prisma from '../../db_client/prisma_client.js';

export const totalSalesReport = async(req,res)=>{  
    const shopId = req.salesman.shopId
    try {
        const totalSales = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{totalPrice:true}
        })
        res.status(200).json({
            message:'The Total Sales',
            totalSales
        });    
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
        const sales = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{quantity:true, totalPrice:true},
        })
        res.status(200).json({
            message:'Product base sales',
            sales
        });
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
        const sales  = await prisma.sale.findMany({ 
            where:{ 
                shopId,
                saleDate:{ 
                    gte: start,
                    lte: end,
                },
            },
        })
        const totalSales = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
        res.status(200).json({ 
            message:`Total sales from ${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()} to ${end.getDate()}-${end.getMonth()+1}-${end.getFullYear()}`,
            totalSales,
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