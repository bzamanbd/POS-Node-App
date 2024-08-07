import { Router } from "express";
import { isSopOwnerLoggedIn } from "../../middlewares/isShopOwnerLoggedIn.js";
import { currentInventory,lowStock } from "./controllers.js";
const routes = Router() 

routes.get("/inventory/current",isSopOwnerLoggedIn,currentInventory) 
routes.get("/inventory/low-stock",isSopOwnerLoggedIn,lowStock) 
 
export default routes