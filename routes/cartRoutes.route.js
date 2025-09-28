import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();
router.use(protecteRoute);

// Get user cart
router.get("/", getCart);

// Add or update product in cart
router.post("/add", addToCart);

// Update quantity of a product
router.patch("/update/:productId", updateQuantity);

// Remove product from cart
router.delete("/remove/:productId", removeFromCart);

// Clear entire cart
router.delete("/clear", clearCart);

export default router;
