import express from "express";
import { getAllProducts, productDetails } from "../controllers/userController.js";

const router = express.Router();

// Routes 
router.get('/', getAllProducts);
router.get("/:id", productDetails);

export default router;