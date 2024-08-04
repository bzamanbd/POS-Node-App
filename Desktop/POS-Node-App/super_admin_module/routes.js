import { Router } from "express"
import { 
    signup,
    signin,
    createShop,
    fetchShops,
    createShopOwner,
    fetchShopOwners 
} from "./salesman_controllers.js"
import { isSuperAdminLoggedIn,isSuperAdmin } from '../middlewares/isSuperAdminLoggedIn.js'

const routes = Router() 

routes.post("/signup", signup)
routes.post("/signin", signin)
routes.post("/shop",isSuperAdminLoggedIn,isSuperAdmin,createShop)
routes.get("/shops",isSuperAdminLoggedIn,isSuperAdmin,fetchShops)
routes.post("/shop-owner",isSuperAdminLoggedIn,isSuperAdmin,createShopOwner)
routes.get("/shop-owners",isSuperAdminLoggedIn,isSuperAdmin,fetchShopOwners)

export default routes