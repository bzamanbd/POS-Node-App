import { Router } from "express";
import { isSopOwnerLoggedIn } from "../../middlewares/isShopOwnerLoggedIn.js";
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

routes.get("/sales/total",isSopOwnerLoggedIn,totalSalesReport) 
routes.get("/sales/total/pdf",isSopOwnerLoggedIn,totalSalesReportPdf) 
routes.get("/sales/total/csv",isSopOwnerLoggedIn,totalSalesReportCsv) 
routes.get("/sales/by-product",isSopOwnerLoggedIn,salesReportByProduct) 
routes.get("/sales/by-product/pdf",isSopOwnerLoggedIn,salesReportByProductPdf) 
routes.get("/sales/by-product/csv",isSopOwnerLoggedIn,salesReportByProductCsv) 
routes.get("/sales/by-date",isSopOwnerLoggedIn,salesReportByDate) 
 


export default routes