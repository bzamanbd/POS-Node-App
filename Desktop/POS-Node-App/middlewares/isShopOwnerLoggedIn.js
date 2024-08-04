import "dotenv/config"
import jwt from "jsonwebtoken"

// Middleware to authenticate and set user in request
export const isSopOwnerLoggedIn = async (req, res, next) => {

  const authHeader = req.headers.authorization;
    
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
      
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const shopOwner = await prisma.shopOwner.findUnique({ where: { id: payload.id } });
    if (!shopOwner) return res.status(401).json({ error: 'Unauthorized' });
    req.shopOwner = shopOwner;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  };
  
// Middleware to check if user is shopOwner
export const isShopOwner = (req, res, next) => {
  if (req.shopOwner.role !== 'SHOP_OWNER') return res.status(403).json({error:'Forbidden'});
  next();
};