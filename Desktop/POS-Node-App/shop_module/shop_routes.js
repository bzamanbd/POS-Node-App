import { Router } from "express"
import {fetchShops,createShop} from './shop_controllers.js'

const routes = Router() 

routes.post("/shop", createShop)
// routes.put("/shop", editShop)
routes.get("/", fetchShops)

export default routes