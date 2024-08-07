import prisma from "../db_client/prisma_client.js"
import appErr from "../utils/appErr.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import 'dotenv/config'


export const signup = async(req, res,next)=>{ 
    const {name,email,password} = req.body 
    const hashedPass = await bcrypt.hash(password, 10) 
    try { 
        const oldEmail = await prisma.user.findUnique({where:{email}})

        if (oldEmail) return next(appErr('user already exist!.  name and email should be unique ',401))
        
        
        const user = await prisma.user.create({
            data:{name,email,password:hashedPass,role:'SUPERADMIN'}
        })

        res.status(201).json({ 
            message:'Registration success',
            user,
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const signin = async(req,res, next)=>{ 
    const {email,password} = req.body
    try {
        const user = await prisma.user.findUnique({ where:{email}})
        if (user && bcrypt.compare(password, user.password)) {

            const tocken = jwt.sign({id:user.id, email:user.email},process.env.JWT_SECRET,{expiresIn: '30m'}) 
            return res.status(200).json({ 
                message:"Login success!", 
                tocken
            })
        }
        return next(appErr('wrong credential!',401))
    } catch (e) {
        return next(appErr(e.message,500))
    } 

}

export const createShop = async(req, res, next)=>{ 

    const {shopName,shopAddress,shopPhone} = req.body 

    try { 
        const oldShop = await prisma.shop.findUnique({where:{shopPhone}})

        if (oldShop)return next(appErr('Shop is already registered',401))
        
        const shop = await prisma.shop.create({ 
            data:{ shopName, shopAddress,shopPhone }
        })

        res.status(201).json({
            success:'Shop is registered',
            shop
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchShops = async(req, res,next)=>{ 

    try { 
        const shops = await prisma.shop.findMany()

        if (!shops) return next(appErr('No Shop available.Create a shop',401))
        
        res.status(200).json({ 
            message:`${shops.length} shop found`,
            shops
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const createShopOwner = async(req, res, next)=>{ 

    const {shopId,name,email,password} = req.body 

    const hashedPass = await bcrypt.hash(password, 10) 

    try { 
        const oldShopOwner = await prisma.shopOwner.findUnique({where:{email}})
        if (oldShopOwner) return next(appErr('Email is already used',401))
        const shopOwner = await prisma.shopOwner.create({ 
            data:{ shopId: parseInt(shopId),name,email,password:hashedPass,role:'SHOP_OWNER' }
        })
        res.status(201).json({
            success:'Shop-owner is registered',
            shopOwner
        })

    } catch (e) {
        return next(appErr(e.message,500))
    }
}



export const fetchShopOwners = async(req, res,next)=>{ 

    try { 
        const shopOwners = await prisma.shopOwner.findMany({include:{shop:true}})
    
        if (!shopOwners) return next('No ShopOwner found',404)
            
        res.status(200).json({ 
            message:`${shopOwners.length} shop-owner found`,
            shopOwners
        })
    } catch (e) {
        return next(appErr(e.message,500))
    }
}