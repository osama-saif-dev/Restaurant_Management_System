import mongoose from "mongoose";
import WishlistItem from "../models/WishlistItem.js";
import Product from "../models/products.js";
import CustomError from "../components/customErrors.js";

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new CustomError("User not found", 404);
    const items = await WishlistItem.find({ user: userId })
      .populate({
        path: "product",
        select: "name price imageUrl isAvailable",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items, count: items.length });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CustomError("Invalid productId", 400);
    }

    // ensure product exists
    const product = await Product.findById(productId).select(
      "_id isAvailable name"
    );
    if (!product) throw new CustomError("Product not found", 404);

    // create wishlist item (unique index prevents duplicates)
    const item = await WishlistItem.create({
      user: userId,
      product: productId,
    });
    const populated = await item.populate({
      path: "product",
      select: "name price imageUrl",
    });

    return res
      .status(201)
      .json({ message: "Added to wishlist", item: populated });
  } catch (err) {
    // handle duplicate key error (already in wishlist)
    if (err.code === 11000) {
      return next(new CustomError("Product already in wishlist", 409));
    }
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    console.log(productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CustomError("Invalid productId", 400);
    }

    const deleted = await WishlistItem.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!deleted) throw new CustomError("Item not found in wishlist", 404);

    return res.json({ message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await WishlistItem.deleteMany({ user: userId });
    return res.json({ message: "Wishlist cleared" });
  } catch (err) {
    throw next(err);
  }
};
