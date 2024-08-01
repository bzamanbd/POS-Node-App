import prisma from "../db_client/prisma_client.js"

export const createShop = async(req, res)=>{ 

const {shopName,shopAddress} = req.body 

try { 
    const oldShop = await prisma.shop.findUnique({where:{shopName}})
    if (oldShop) {
        return res.status(401).json({ 
            message:'Shop Name should be unique'
        })
    }
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
        if (shops.length < 1) {
            return res.status(401).json({ 
                message:'No Shop available. Please register a new shop'
            })
        }
        res.status(200).json({ 
            message:`${shops.length} shop available`,
            shops
        })
    } catch (e) {
        res.status(500).json({ 
            error:"Something went wrong!", 
            e
        })
    }
    }
    