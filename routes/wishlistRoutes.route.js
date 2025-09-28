import express from "express";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(protecteRoute);

// get all wishlist items for logged in user
router.get("/", getWishlist);

// add a product to wishlist
router.post("/:productId", addToWishlist);

// remove a specific product from wishlist
router.delete("/:productId", removeFromWishlist);

// clear wishlist
router.delete("/", clearWishlist);

export default router;
