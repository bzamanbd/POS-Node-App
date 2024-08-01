import { Router } from "express";
import { isLoggedin } from "../middlewares/isLoggedin.js";
import { fetchSales,createSales } from "./sales_controllers.js";
const routes = Router() 

routes.get("/",isLoggedin,fetchSales) 
// routes.get("/search", searchPost)
// routes.get("/:id", viewPost) 
// routes.put("/:id", authMiddleware, mediaUploader.fields([{name:'images',maxCount:5},{name:'videos',maxCount:2}]), mediaProcessor, editPost) 
// routes.delete("/:id",authMiddleware, deletePost) 
routes.post("/sale",isLoggedin,createSales)

export default routes