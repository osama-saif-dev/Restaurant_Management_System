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

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Order
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  schemaResponse(createOrderSchema, req.body);
  const { shippingAddress, paymentMethod = "COD", shippingMethodId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(shippingMethodId))
    throw new CustomError("Shipping method is invalid", 400);

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price discountedPrice image quantity"
  );
  if (!cart) throw new CustomError("Cart not found", 404);
  if (cart.items.length === 0) throw new CustomError("Cart is empty", 400);

  const shippingMethod = await ShippingMethod.findById(shippingMethodId);
  if (!shippingMethod || !shippingMethod.isActive) {
    throw new CustomError("Invalid or inactive shipping method", 400);
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
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

    product.quantity -= item.quantity;
    await product.save();
  }

  const taxRate = 0.1;
  const tax = +(subtotal * taxRate).toFixed(2);
  const deliveryFee = shippingMethod.fee;
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  // لو طريقة الدفع Stripe نعمل PaymentIntent
  let paymentIntent;
  if (paymentMethod === "Stripe") {
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // بالـ cents
      currency: "usd",
      metadata: { userId },
      description: "Order Payment",
    });
  }

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
    paymentIntentId: paymentIntent ? paymentIntent.id : null,
  });

  cart.items = [];
  await cart.save();

  // Response based on payment method
  if (paymentMethod === "Stripe") {
    res.status(201).json({
      message: "Stripe payment initiated",
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } else {
    res.status(201).json({
      message: "Order placed successfully (Cash on Delivery)",
      order,
    });
  }
});

// Mark Order as Paid (for Stripe orders)
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) throw new CustomError("Order not found", 404);

  order.paymentStatus = "paid";
  await order.save();

  res.json({ message: "Order marked as paid", order });
});


export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("items.product", "name image quantity priceAtOrder");
  // .populate("shippingMethod", "name fee");
  res.status(200).json(orders);
});

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
