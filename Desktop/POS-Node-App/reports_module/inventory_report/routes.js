import { Router } from "express";
import { isLoggedin } from "../../middlewares/isLoggedin.js";
import { currentInventory,lowStock } from "./controllers.js";
const routes = Router() 

routes.get("/inventory/current",isLoggedin,currentInventory) 
routes.get("/inventory/low-stock",isLoggedin,lowStock) 
 
export default routes