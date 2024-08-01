import prisma from "../db_client/prisma_client.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import 'dotenv/config'


export const signup = async(req, res)=>{ 
const {shopId,name,email,password} = req.body 
const hashedPass = await bcrypt.hash(password, 10) 
try { 
    const oldName = await prisma.salesman.findUnique({where:{name}})
    const oldEmail = await prisma.salesman.findUnique({where:{email}})
    if (oldName || oldEmail) {
        return res.status(401).json({ 
            message:'name and email should be unique'
        })
    }
    const salesman = await prisma.salesman.create({ 
        data:{ 
            shopId,
            name,
            email,
            password:hashedPass,
        }
    })
    res.status(201).json({ 
        message:'Registration success',
        salesman,
    })
} catch (e) {
    res.status(500).json({ 
        error:"Something went wrong!", 
        e
    })
}
}

export const signin = async(req,res)=>{ 
    const {email,password} = req.body
    try {
        const salesman = await prisma.salesman.findUnique({ where:{email}})
        if (salesman && bcrypt.compare(password, salesman.password)) {
            const tocken = jwt.sign({salesmanId:salesman.id, shopId:salesman.shopId},process.env.JWT_SECRET,{expiresIn: '30m'}) 
            return res.status(200).json({ 
                message:"Login success!", 
                tocken
            })
        }
        res.status(401).json({ 
            message:"Unauthorized user"
        })        
    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    } 

}


export const fetchSalesmen = async(req, res)=>{ 
    const shopId = req.salesman.shopId
    try { 
        const salesmen = await prisma.salesman.findMany({ 
            where:{ 
                shopId
            },
            select:{ 
                id:true,
                name:true,
                shop:{select:{id:true,shopName:true,shopAddress:true,shopPhone:true}},
                sales:{select:{
                    id:true,
                    totalPrice:true,
                    saleItems:{select:{
                        id:true,
                        quantity:true,
                        totalPrice:true,
                        product:{select:{id:true,name:true,description:true,salePrice:true}},
                        }},
                    saleDate:true,
                }},
            },
        })
        if (!salesmen) {
            return res.status(401).json({ 
                message:'No Salesman available. Please signup a new salesman'
            })
        }
        res.status(200).json({ 
            message:`${salesmen.length} salesman found`,
            salesmen
        })
    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    }
    }
    

