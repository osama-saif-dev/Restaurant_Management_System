import mongoose from "mongoose";

// Order item
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: { type: Number, required: true },
  priceAtOrder: { type: Number, required: true },
});

// Order status history
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Order
const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    total: Number,
    shippingMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: true, // if every order must have a method
    },
    paymentMethod: { type: String, enum: ["COD", "Card"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: String,
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

// static helper for valid transitions
OrderSchema.statics.isValidTransition = function (from, to) {
  const flow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };
  return flow[from]?.includes(to);
};

export default mongoose.model("Order", OrderSchema);
