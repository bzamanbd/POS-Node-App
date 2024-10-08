import prisma from "../db_client/prisma_client.js";
import "dotenv/config"
import jwt from "jsonwebtoken"
import appErr from "../utils/appErr.js";


export const isSalesmanLoggedIn = async (req, res, next) => {

  const authHeader = req.headers.authorization;
    
  if (!authHeader) return next(appErr('No token provided',401))

  const token = authHeader.split(' ')[1];
      
  if (!token) return next(appErr('Unauthorized',401)) 
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const salesMan = await prisma.salesman.findUnique({ where: {id:payload.id} });

    console.log(salesMan);
    
    if (!salesMan) return next(appErr('Unauthorized',401))

    req.salesMan = salesMan;

    next();

  } catch (e) {
    return next(appErr('Tocken is expired or incorrect',498))
  }
  }