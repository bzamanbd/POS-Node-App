import "dotenv/config"
import jwt from "jsonwebtoken"

export const isLoggedin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, process.env.JWT_SECRET, (err, salesman) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.salesman = salesman
      next();
    });
  }