import { Router } from "express";
import{isSopOwnerLoggedIn} from '../../middlewares/isShopOwnerLoggedIn.js'
import { totalProfit,profitByProduct,profitByDate } from "./controllers.js";
const routes = Router() 

routes.get("/profit/total",isSopOwnerLoggedIn,totalProfit) 
routes.get("/profit/by-product",isSopOwnerLoggedIn,profitByProduct) 
routes.get("/profit/by-date",isSopOwnerLoggedIn,profitByDate) 
 


export default routes