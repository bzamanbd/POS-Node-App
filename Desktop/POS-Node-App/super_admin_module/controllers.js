import prisma from "../db_client/prisma_client.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import 'dotenv/config'


export const signup = async(req, res)=>{ 
    const {name,email,password} = req.body 
    const hashedPass = await bcrypt.hash(password, 10) 
    try { 
        const oldEmail = await prisma.user.findUnique({where:{email}})

        if (oldEmail) return res.status(401).json({ message:'name and email should be unique'})
        
        const user = await prisma.user.create({data:{name,email,password:hashedPass}})

        res.status(201).json({ 
            message:'Registration success',
            user,
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
        const user = await prisma.user.findUnique({ where:{email}})
        if (user && bcrypt.compare(password, user.password)) {

            const tocken = jwt.sign({userId:user.id, email:user.email},process.env.JWT_SECRET,{expiresIn: '30m'}) 
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


export const createShop = async(req, res)=>{ 

    const {shopName,shopAddress,shopPhone} = req.body 

    try { 
        const oldShop = await prisma.shop.findUnique({where:{shopPhone}})

        if (oldShop)return res.status(401).json({ message:'Shop is already registered'})
        
        const shop = await prisma.shop.create({ 
            data:{ shopName, shopAddress }
        })

        res.status(201).json({
            success:'Shop is registered',
            shop
        })
    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    }
}


export const fetchShops = async(req, res)=>{ 

    try { 
        const shops = await prisma.shop.findMany()

        if (!shops) return res.status(401).json({message:'No Shop available.Create a shop'})
        
        res.status(200).json({ 
            message:`${shops.length} shop found`,
            shops
        })
    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    }
}




export const createShopOwner = async(req, res)=>{ 

    const {shopId,name,email,password} = req.body 

    const hashedPass = await bcrypt.hash(password, 10) 

    try { 
        const oldShopOwner = await prisma.shopOwner.findUnique({where:{email}})

        if (oldShopOwner)return res.status(401).json({message:'Email is already used'})
        
        const shopOwner = await prisma.shopOwner.create({ 
            data:{ shopId,name,email,password:hashedPass }
        })

        res.status(201).json({
            success:'Shop-owner is registered',
            shopOwner
        })

    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    }
}



export const fetchShopOwners = async(req, res)=>{ 

    try { 
        const shopOwners = await prisma.ShopOwner.findMany()
    
        if (!shopOwners) return res.status(401).json({message:'No ShopOwner found'})
            
        res.status(200).json({ 
            message:`${shopOwners.length} shop-owner found`,
            shopOwners
        })
    } catch (e) {
        res.status(500).json({ 
        error:"Something went wrong!", 
        e
        })
    }
}