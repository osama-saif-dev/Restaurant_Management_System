import express from "express";
import { getAllProducts, productDetails, getSubcategories } from "../controllers/userController.js";

const router = express.Router();

// Routes 
router.get('/', getAllProducts);
router.get("/get-subcategories", getSubcategories)
router.get("/:id", productDetails);

export default router;