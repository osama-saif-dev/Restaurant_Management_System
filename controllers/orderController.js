import mongoose from "mongoose";
import { asyncHandler } from "../components/asyncHandler.js";
import CustomError from "../components/customErrors.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import ShippingMethod from "../models/ShippingMethod.js";
import { schemaResponse } from "../components/schemaResponse.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/order.validation.js";

/**
 * @des Create order
 * @route POST /api/orders
 * @access User
 */
export const createOrder = asyncHandler(async (req, res) => {
  // 1. get the user and data (Shipping Address, Payment Method)
  const userId = req.user.id;
  // Validate body
  schemaResponse(createOrderSchema, req.body);
  const { shippingAddress, paymentMethod = "COD", shippingMethodId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(shippingMethodId))
    throw new CustomError("Shipping method is invalid", 400);

  // 2. get the cart
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price discountedPrice image quantity"
  );
  if (!cart) throw new CustomError("Cart not found", 404);
  if (cart.items.length === 0) throw new CustomError("Cart is empty", 400);

  // Validate shipping method
  const shippingMethod = await ShippingMethod.findById(shippingMethodId);
  if (!shippingMethod || !shippingMethod.isActive) {
    throw new CustomError("Invalid or inactive shipping method", 400);
  }

  // 3. Check stock and build items
  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    // check if quantity is available
    if (item.quantity > product.quantity) {
      throw new CustomError(
        `Only ${item.product.quantity} units available`,
        400
      );
    }

    const price = product.discountedPrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      quantity: item.quantity,
      priceAtOrder: price,
    });

    // Reduce stock
    product.quantity -= item.quantity;
    await product.save();
  }

  // calculate total
  // **TODO: STATIC TAX OF 10% ON SUBTOTAL BUT NEED TO MAKE IT DYNAMIC **
  const taxRate = 0.1;
  const tax = +(subtotal * taxRate).toFixed(2); // TODO: GETTING TAX FROM CONFIG
  const deliveryFee = shippingMethod.fee;
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  // 4. create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    shippingMethod,
    shippingAddress,
    paymentMethod,
  });

  // 5. clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ message: "Order placed successfully", order });
});

/**
 * @des Get my orders
 * @route GET /api/orders/me
 * @access User
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("items.product", "name image quantity priceAtOrder");
  // .populate("shippingMethod", "name fee");
  res.status(200).json(orders);
});

/**
 * @des Get order by id
 * @route GET /api/orders/:id
 * @access User
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(orderId))
    throw new CustomError("Invalid Order", 400);

  const order = await Order.findById(orderId)
    .populate("items.product", "name image")
    .populate("shippingMethod", "name fee");

  if (!order) throw new CustomError("Order not found", 404);
  if (order.user.toString() !== req.user.id)
    throw new CustomError("Not authorized", 403);

  res.status(200).json(order);
});

/**
 * @des Get all orders
 * @route GET /api/orders
 * @access Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "name image quantity priceAtOrder")
    .populate("shippingMethod", "name fee")
    .sort("-createdAt");

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
});

/**
 * @des Update order status
 * @route PATCH /api/orders/:id/status
 * @access Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params; // order ID
  const { newStatus } = req.body;
  const adminId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError("Invalid Order", 400);

  // Validate status
  schemaResponse(updateOrderStatusSchema, req.body);

  const order = await Order.findById(id);
  if (!order) throw new CustomError("Order not found", 404);

  // Validate allowed transitions
  if (!Order.isValidTransition(order.orderStatus, newStatus)) {
    throw new CustomError(
      `Invalid status change from ${order.orderStatus} → ${newStatus}`,
      400
    );
  }

  order.orderStatus = newStatus;

  // Push to audit log
  order.statusHistory.push({
    status: newStatus,
    changedBy: adminId,
    changedAt: new Date(),
  });

  await order.save();

  res.status(200).json({
    message: "Order status updated",
    order: {
      id: order._id,
      currentStatus: order.orderStatus,
      statusHistory: order.statusHistory,
    },
  });
});
