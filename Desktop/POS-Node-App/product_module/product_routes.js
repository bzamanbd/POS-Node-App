import { Router } from "express";
import { isLoggedin } from "../middlewares/isLoggedin.js";
import { fetchProducts,createProduct } from "./product_controllers.js";

const routes = Router() 

routes.get("/",isLoggedin,fetchProducts) 
// routes.get("/search", searchPost)
// routes.get("/:id", viewPost) 
// routes.put("/:id", authMiddleware, mediaUploader.fields([{name:'images',maxCount:5},{name:'videos',maxCount:2}]), mediaProcessor, editPost) 
// routes.delete("/:id",authMiddleware, deletePost) 
routes.post("/product",isLoggedin,createProduct)

export default routes