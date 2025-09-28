import express from "express";
import { productDetails } from "../controllers/userController.js";

const router = express.Router();

// Routes 
router.get("/:id", productDetails);

export default router;