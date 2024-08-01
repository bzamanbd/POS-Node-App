import { Router } from "express"; 
import shopRoutes from '../shop_module/shop_routes.js'
import salesmenRoutes from '../salesman_module/salesman_routes.js'
import categoryRoutes from '../category_module/category_routes.js'
import productRoutes from '../product_module/product_routes.js' 
import salesRoutes from '../sales_module/sales_routes.js'
import salesReports from '../reports_module/sales_report/routes.js'

const router = Router()

router.use("/api/shops", shopRoutes)
router.use("/api/salesmen", salesmenRoutes)
router.use("/api/categories", categoryRoutes)
router.use("/api/products", productRoutes)
router.use("/api/sales", salesRoutes)
router.use("/api/reports", salesReports)

export default router