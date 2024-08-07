import { Router } from "express"
import { signin,createSale } from "./controllers.js"
import { isSalesmanLoggedIn } from "../middlewares/isSalesmanLoggedIn.js"

const routes = Router() 
 
routes.post("/signin", signin)

routes.post("/sale", isSalesmanLoggedIn, createSale)

export default routes