import { Router } from "express";
import { isLoggedin } from "../../middlewares/isLoggedin.js";
import { totalSalesReport,salesReportByProduct,salesReportByDate } from "./controllers.js";
const routes = Router() 

routes.get("/sales/total",isLoggedin,totalSalesReport) 
routes.get("/sales/by-product",isLoggedin,salesReportByProduct) 
routes.get("/sales/by-date",isLoggedin,salesReportByDate) 
 


export default routes