import prisma from "../db_client/prisma_client.js";
import appErr from "../utils/appErr.js";
import jwt from "jsonwebtoken"
import "dotenv/config"

export const isSuperAdminLoggedIn = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    
    if (!authHeader) return next(appErr('No token provided',401))

    const token = authHeader.split(' ')[1];
    

    if (!token) return next(appErr('Unauthorized',401))

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: {id:payload.id} })
        if (!user) return next(appErr('Unauthorized',401))
        req.user = user;
        next();
    } catch (e) {
      return next(appErr('Tocken is expired or incorrect',498))
    }
  };

  // Middleware to check if user is superAdmin
export const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SUPERADMIN') return next(appErr('Forbidden',403))
    next();
  };