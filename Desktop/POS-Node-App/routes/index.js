import { Router } from "express" 
import superAdminRoutes from '../super_admin_module/routes.js'
import shopOwnerRoutes from '../shop_owner_module/routes.js'
import salesmanRoutes from '../salesman_module/routes.js'

// import salesmenRoutes from '../salesman_module/salesman_routes.js'
// import categoryRoutes from '../category_module/category_routes.js'
// import productRoutes from '../product_module/product_routes.js' 
// import salesRoutes from '../sales_module/sales_routes.js'
import salesReports from '../reports_module/sales_report/routes.js'
import inventoryReports from '../reports_module/inventory_report/routes.js'
import profitReports from '../reports_module/profit_report/routes.js'

const router = Router()

router.use("/api/super-admin", superAdminRoutes)
router.use("/api/shop-owner", shopOwnerRoutes)
router.use("/api/salesman", salesmanRoutes)
// router.use("/api/categories", categoryRoutes)
// router.use("/api/products", productRoutes)
// router.use("/api/sales", salesRoutes)
router.use("/api/reports", salesReports)
router.use("/api/reports", inventoryReports)
router.use("/api/reports", profitReports)

export default router