import express from "express";
import { getAllProducts, productDetails, getSubcategories } from "../controllers/userController.js";

const router = express.Router();

// Routes 
router.get('/', getAllProducts);
router.get("/:id", productDetails);
router.get("/get-subcategories", getSubcategories)

export default router;