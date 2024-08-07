import prisma from "../db_client/prisma_client.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import appErr from "../utils/appErr.js"


export const signin = async(req,res,next)=>{ 
    const {email,password} = req.body
    try {
        const salesman = await prisma.salesman.findUnique({ where:{email}})
        if (salesman && bcrypt.compare(password, salesman.password)) {
            const tocken = jwt.sign({id:salesman.id, shopId:salesman.shopId},process.env.JWT_SECRET,{expiresIn: '30m'}) 
            return res.status(200).json({ 
                message:"Login success!", 
                tocken
            })
        }
        res.status(401).json({ 
            message:"Unauthorized user"
        })        
    } catch (e) {
        return next(appErr(e.message,500))
    } 

}



export const createSale = async (req,res,next)=>{
    const {saleItems} = req.body 
    const shopId = req.salesMan.shopId
    const salesmanId = req.salesMan.id
    
    try {
      const sale = await prisma.sale.create({
        data: {
          shop: { connect: { id: parseInt(shopId) } },
          salesman: { connect: { id: parseInt(salesmanId) } },
          saleItems: {
            create: saleItems.map(item => ({
              ...item,
              shopId: parseInt(shopId) 
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

    } catch (e) {
      return next(appErr(e.message,500))
    }

}

