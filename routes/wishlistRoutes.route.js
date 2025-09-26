import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// get all wishlist items for logged in user
router.get("/", protecteRoute, getWishlist);

// add a product to wishlist
router.post("/:productId", protecteRoute, addToWishlist);

// remove a specific product from wishlist
router.delete("/:productId", protecteRoute, removeFromWishlist);

// clear wishlist
router.delete("/", protecteRoute, clearWishlist);

export default router;
