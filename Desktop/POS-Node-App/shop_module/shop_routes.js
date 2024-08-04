import { Router } from "express"
import {isSuperAdminLoggedIn,isSuperAdmin} from '../middlewares/isSuperAdminLoggedIn.js'
import {fetchShops,createShop} from './shop_controllers.js'

const routes = Router() 

routes.post("/shop",isSuperAdminLoggedIn,isSuperAdmin,createShop)

routes.get("/",isSuperAdminLoggedIn,isSuperAdmin,fetchShops)

export default routes