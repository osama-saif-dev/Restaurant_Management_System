import { asyncHandler } from "../components/asyncHandler.js";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/products.js";
import CustomError from "../components/customErrors.js";
import { schemaResponse } from "../components/schemaResponse.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../validations/cart.validation.js";

/**
 * @des Get user cart
 * @route GET /api/cart
 * @access User
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
    "id name price discountedPrice image"
  );

  const totalPrice = cart.items.reduce(
    (sum, i) => sum + i.priceAtAdd * i.quantity,
    0
  );

  res.status(200).json({ ...cart.toObject(), totalPrice } || { items: [] });
});

/**
 * @des Add product to cart
 * @route POST /api/cart/add
 * @access User
 */
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId))
    throw new CustomError("Invalid product", 400);

  schemaResponse(addToCartSchema, req.body);

  const product = await Product.findById(productId).select(
    "name price discountedPrice image isAvailable quantity"
  );
  if (!product) throw new CustomError("Product not found", 404);
  // if (!product.isAvailable)
  //   throw new CustomError("Product not available", 400);

  const requestedQty = Number(quantity);

  if (requestedQty < 1)
    throw new CustomError("Quantity must be at least 1", 400);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    if (existingItem.quantity + requestedQty > product.quantity) {
      throw new CustomError(
        `Only ${product.quantity - existingItem.quantity} more units available`,
        400
      );
    }
    existingItem.quantity += requestedQty;

    existingItem.priceAtAdd = product.discountedPrice || product.price; // update snapshot if desired
  } else {
    // Check if quantity is available
    if (requestedQty > product.quantity) {
      throw new CustomError(`Only ${product.quantity} units available`, 400);
    }
    cart.items.push({
      product: productId,
      requestedQty,
      priceAtAdd: product.discountedPrice || product.price,
    });
  }

  await cart.save();
  const populated = await cart.populate(
    "items.product",
    "name price discountedPrice image"
  );

  res.status(200).json({ message: "Cart updated", cart: populated });
});

/**
 * @des Update quantity of product in cart
 * @route PATCH /api/cart/update/:productId
 * @access User
 */
export const updateQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  schemaResponse(updateQuantitySchema, req.body);

  const requestedQty = Number(quantity);

  if (requestedQty < 1)
    throw new CustomError("Quantity must be at least 1", 400);

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) throw new CustomError("Cart not found", 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new CustomError("Product not in cart", 404);

  // Fetch product to check is Available
  const product = await Product.findById(productId).select("quantity");
  if (!product) throw new CustomError("Product not found", 404);

  // check if quantity is available
  if (requestedQty > Number(product.quantity)) {
    throw new CustomError(`Only ${product.quantity} units available`, 400);
  }

  item.quantity = requestedQty;
  await cart.save();

  const populated = await cart.populate(
    "items.product",
    "name price discountedPrice image"
  );
  res.status(200).json({ message: "Quantity updated", cart: populated });
});

/**
 * @des Remove product from cart
 * @route DELETE /api/cart/remove/:productId
 * @access User
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { items: { product: productId } } },
    { new: true }
  ).populate("items.product", "name price discountedPrice image");

  if (!cart) throw new CustomError("Cart not found", 404);

  res.status(200).json({ message: "Item removed", cart });
});

/**
 * @des Clear cart
 * @route DELETE /api/cart
 * @access User
 */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });
  res.status(200).json({ message: "Cart cleared" });
});
