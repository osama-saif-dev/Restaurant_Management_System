import { asyncHandler } from "../components/asyncHandler.js";
import mongoose from "mongoose";
import WishlistItem from "../models/WishlistItem.js";
import Product from "../models/products.js";
import CustomError from "../components/customErrors.js";


export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) throw new CustomError("User not found", 404);
  const items = await WishlistItem.find({ user: userId })
    .populate({
      path: "product",
      select: "id name price image discountedPrice",
    })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ items, count: items.length });
});


export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new CustomError("Invalid product", 400);
  }

  // ensure product exists
  const product = await Product.findById(productId).select(
    "_id name image price"
  );
  if (!product) throw new CustomError("Product not found", 404);

  // check if already in wishlist
  const exists = await WishlistItem.findOne({
    user: userId,
    product: productId,
  });
  if (exists) {
    return res.status(200).json({
      message: "Product already in wishlist",
      item: await exists.populate({
        path: "product",
        select: "name price image",
      }),
    });
  }

  // create wishlist item (unique index prevents duplicates)
  const item = await WishlistItem.create({
    user: userId,
    product: productId,
  });
  const populated = await item.populate({
    path: "product",
    select: "name price image",
  });

  return res
    .status(201)
    .json({ message: "Added to wishlist", item: populated });
});


export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new CustomError("Invalid product", 400);
  }

  const deleted = await WishlistItem.findOneAndDelete({
    user: userId,
    product: productId,
  });

  if (!deleted) throw new CustomError("Item not found in wishlist", 404);

  return res.json({ message: "Removed from wishlist" });
});


export const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await WishlistItem.deleteMany({ user: userId });
  return res.json({ message: "Wishlist cleared" });
});
