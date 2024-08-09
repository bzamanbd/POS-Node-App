import prisma from "../db_client/prisma_client.js";
import "dotenv/config"
import jwt from "jsonwebtoken"
import appErr from "../utils/appErr.js";

// Middleware to authenticate and set user in request
export const isSopOwnerLoggedIn = async (req, res, next) => {

  const authHeader = req.headers.authorization;
    
  if (!authHeader) return next(appErr('No token provided',401))

  const token = authHeader.split(' ')[1];
      
  if (!token) return next(appErr('Unauthorized',401)) 
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const shopOwner = await prisma.shopOwner.findUnique({ where: {id:payload.id} });

    console.log(shopOwner);
    
    if (!shopOwner) return next(appErr('Unauthorized',401))
    req.shopOwner = shopOwner;
    next();
  } catch (e) {
    return next(appErr('Tocken is expired or incorrect',498))
  }
  };
  
// Middleware to check if user is shopOwner
export const isShopOwner = (req, res, next) => {
  if (req.shopOwner.role !== 'SHOP_OWNER') return next(appErr('Forbidden',403))
  next();
};