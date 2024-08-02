import { Router } from "express";
import { isLoggedin } from "../../middlewares/isLoggedin.js";
import { 
    totalSalesReport,
    salesReportByProduct,
    salesReportByDate,
    totalSalesReportPdf,
    salesReportByProductPdf,
    totalSalesReportCsv,
    salesReportByProductCsv
} from "./controllers.js";

const routes = Router() 

routes.get("/sales/total",isLoggedin,totalSalesReport) 
routes.get("/sales/total/pdf",isLoggedin,totalSalesReportPdf) 
routes.get("/sales/total/csv",isLoggedin,totalSalesReportCsv) 
routes.get("/sales/by-product",isLoggedin,salesReportByProduct) 
routes.get("/sales/by-product/pdf",isLoggedin,salesReportByProductPdf) 
routes.get("/sales/by-product/csv",isLoggedin,salesReportByProductCsv) 
routes.get("/sales/by-date",isLoggedin,salesReportByDate) 
 


export default routes