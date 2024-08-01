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
    const shopId = req.salesman.shopId
    try {
        const sales  = await prisma.sale.findMany({ 
            where:{
                shopId,
            },
             select:{ 
                id:true,
                totalPrice: true,
                shop:{select:{ id:true, shopName:true, shopAddress:true, shopPhone:true }},
                salesman:{select:{ id:true, shopId:true, name:true }},
                saleItems:{select:{
                  id: true,
                  saleId:true,
                  quantity: true,
                  totalPrice: true,
                  profit: true,
                  product:{select:{
                    id:true,
                    shopId:true,
                    name:true,
                    description:true,
                    category:{select:{name:true}},
                  }}
                }},
                saleDate: true,
             },
        })
        if (sales.length <1) {
          return res.status(200).json({ 
            message:'no sales available. please create a sale',
            sales
          })
        }
        return res.status(200).json({
          message:`${sales.length} sales available`,
          sales
        })
    } catch (e) {
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}