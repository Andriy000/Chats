import express from "express";
import { getAllProducts, createProduct,getProductById ,updateProduct, deleteProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/getProduct", getAllProducts);
router.post("/create", createProduct);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/getById/:id", getProductById);

export default router;