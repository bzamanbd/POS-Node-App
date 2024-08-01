import { Router } from "express"
import { signup,signin,fetchSalesmen } from "./salesman_controllers.js"
import { isLoggedin } from "../middlewares/isLoggedin.js"

const routes = Router() 

routes.post("/signup", signup)
 
routes.post("/signin", signin)

routes.get("/", isLoggedin, fetchSalesmen)

export default routes