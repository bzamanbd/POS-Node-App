import prisma from "../db_client/prisma_client.js";
import jwt from "jsonwebtoken"
import "dotenv/config"

// Middleware to authenticate and set user in request
export const isSuperAdminLoggedIn = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    

    if (!token) return res.status(401).json({ error: 'Invalid tocken' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: {id:payload.id} });
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        req.user = user;
        next();
    } catch (err) {
      return res.status(401).json({ error: err });
    }
  };

  // Middleware to check if user is superAdmin
export const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  };