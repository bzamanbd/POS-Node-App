import prisma from "../db_client/prisma_client.js";

export const createSales = async (req,res)=>{
    const {saleItems} = req.body 
    const shopId = req.salesman.shopId
    const salesmanId = req.salesman.salesmanId
    
    try {
      const sale = await prisma.sale.create({
        data: {
          shop: { connect: { id: shopId } },
          salesman: { connect: { id: salesmanId } },
          saleItems: {
            create: saleItems.map(item => ({
              ...item,
              shopId: shopId
            }))
          }
        },
        include: {
          saleItems: true
        }
      });
  
      // Calculate profit and total price for each sale item
      for (const item of sale.saleItems) {
        await prisma.calculateSaleItemProfitAndUpdateProduct(item.id);
      }
  
      // Calculate the total price and profit of the sale
      await prisma.calculateSaleTotalPriceAndProfit(sale.id);

      // Fetch the updated sale with sale items
      const finalSale = await prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          saleItems: true,
        },
    });
  
      res.status(201).json({
        success:'sale is created',
        finalSale
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }

};


export const fetchSales = async(req,res)=>{  
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