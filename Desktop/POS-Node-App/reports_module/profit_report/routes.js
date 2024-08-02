import { Router } from "express";
import { isLoggedin } from "../../middlewares/isLoggedin.js";
import { totalProfit,profitByProduct,profitByDate } from "./controllers.js";
const routes = Router() 

routes.get("/profit/total",isLoggedin,totalProfit) 
routes.get("/profit/by-product",isLoggedin,profitByProduct) 
routes.get("/profit/by-date",isLoggedin,profitByDate) 
 


export default routes