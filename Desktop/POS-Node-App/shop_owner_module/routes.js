import { Router } from "express"
import { signin,createSalesMan,fetchSalesMen,createCategory,fetchCategories,createProduct,
    fetchProducts,createSale,fetchSales } from "./salesman_controllers.js"
import { isSopOwnerLoggedIn, isShopOwner } from '../middlewares/isShopOwnerLoggedIn.js'

const routes = Router() 


routes.post("/signin", signin)
routes.post("/salesman",isSopOwnerLoggedIn,isShopOwner,createSalesMan)
routes.get("/salesmen",isSopOwnerLoggedIn,isShopOwner,fetchSalesMen)
routes.post("/category",isSopOwnerLoggedIn,isShopOwner,createCategory)
routes.get("/categories",isSopOwnerLoggedIn,isShopOwner,fetchCategories)
routes.post("/product",isSopOwnerLoggedIn,isShopOwner,createProduct)
routes.get("/products",isSopOwnerLoggedIn,isShopOwner,fetchProducts)
routes.post("/sale",isSopOwnerLoggedIn,isShopOwner,createSale)
routes.get("/sales",isSopOwnerLoggedIn,isShopOwner,fetchSales)

export default routes