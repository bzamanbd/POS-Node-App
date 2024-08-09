import prisma from "../db_client/prisma_client.js"
import appErr from "../utils/appErr.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import appRes from "../utils/appRes.js"


export const signup = async(req, res,next)=>{ 
    const {name,email,password} = req.body
    if(!name || !email || !password) return next(appErr('name, email and password are required'),400) 
    const hashedPass = await bcrypt.hash(password, 10) 
    try { 
        const oldEmail = await prisma.user.findUnique({where:{email}})

        if (oldEmail) return next(appErr('user already exist!. name and email should be unique ',401))
        
        
        const user = await prisma.user.create({
            data:{name,email,password:hashedPass,role:'SUPERADMIN'}
        })
        user.password = undefined
        appRes(res,201,'','Registration success',{user})
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const signin = async(req,res, next)=>{ 
    const {email,password} = req.body
    if(!email || !password) return next(appErr('email and password are required'),400) 
    try {
        const user = await prisma.user.findUnique({ where:{email}})
        if (user && bcrypt.compare(password, user.password)) {

            const tocken = jwt.sign({id:user.id, email:user.email},process.env.JWT_SECRET,{expiresIn: '30m'}) 

            appRes(res,200,'','Login success!',{tocken})
        }
        return next(appErr('wrong credential!',401))
    } catch (e) {
        return next(appErr(e.message,500))
    } 

}

export const createShop = async(req, res, next)=>{ 

    const {shopName,shopAddress,shopPhone} = req.body 
    if(!shopName || !shopPhone) return next(appErr('shopName and shopPhone are required'),400)

    try { 
        const oldShop = await prisma.shop.findUnique({where:{shopPhone}})

        if (oldShop)return next(appErr('Phone number is already used',401))
        
        const shop = await prisma.shop.create({ 
            data:{ shopName, shopAddress,shopPhone }
        })

        appRes(res,201,'','Shop is registered',{shop})

    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const createShopOwner = async(req, res, next)=>{ 

    const {shopId,name,email,password} = req.body 

    if(!shopId || !name || !email || !password) return next(appErr('shopId,name,email and password are required'),400)

    const hashedPass = await bcrypt.hash(password, 10) 

    try { 
        const oldShopOwner = await prisma.shopOwner.findUnique({where:{email}})
        if (oldShopOwner) return next(appErr('Email is already used',401))
        const shopOwner = await prisma.shopOwner.create({ 
            data:{ shopId: parseInt(shopId),name,email,password:hashedPass,role:'SHOP_OWNER' }
        })
        shopOwner.password = undefined
        appRes(res,201,'','Shop-owner is registered',{shopOwner})

    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchShops = async(req, res,next)=>{ 

    try { 
        const shops = await prisma.shop.findMany()

        if (shops.length <1) return appRes(res,404,'False','No shop found!',{shops})
        appRes(res,200,'',`${shops.length} shop found`,{shops})
        
    } catch (e) {
        return next(appErr(e.message,500))
    }
}

export const fetchShopOwners = async(req, res,next)=>{ 

    try { 
        const shopOwners = await prisma.shopOwner.findMany({
            select:{
                id:true, 
                name:true,
                email:true,
                shopId:true,
                role:true,
                createdAt:true,
                updatedAt:true,
                shop:true
            }
        },)
    
        if (shopOwners.length<1) return appRes(res,404,'False','No ShopOwner found',{shopOwners})
        appRes(res,200,'',`${shopOwners.length} shop-owner found`,{shopOwners})
    } catch (e) {
        return next(appErr(e.message,500))
    }
}