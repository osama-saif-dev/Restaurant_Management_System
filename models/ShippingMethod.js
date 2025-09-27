import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fee: { type: Number, required: true },
    estimatedDays: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ShippingMethod", shippingMethodSchema);
