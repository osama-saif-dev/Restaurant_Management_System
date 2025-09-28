import { asyncHandler } from "../components/asyncHandler.js";
import ShippingMethod from "../models/ShippingMethod.js";
import CustomError from "../components/customErrors.js";
import mongoose from "mongoose";

// Public (Get all active shipping methods)
export const listShippingMethods = asyncHandler(async (_req, res) => {
  const methods = await ShippingMethod.find({ isActive: true });
  res.status(200).json(methods);
});

// Admin (Protected)
export const createShippingMethod = asyncHandler(async (req, res) => {
  const { name, fee, estimatedDays } = req.body;
  if (!name || fee == null)
    throw new CustomError("Name and fee are required", 400);

  const method = await ShippingMethod.create({ name, fee, estimatedDays });
  res.status(201).json({ message: "Shipping method created", method });
});

export const updateShippingMethod = asyncHandler(async (req, res) => {
  const { name, fee, estimatedDays, isActive } = req.body;
  const methodId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(methodId))
    throw new CustomError("Invalid Method Shipping", 400);

  const method = await ShippingMethod.findByIdAndUpdate(
    methodId,
    { name, fee, estimatedDays, isActive },
    { new: true }
  );
  if (!method) throw new CustomError("Method not found", 404);
  res.status(200).json({ message: "Updated", method });
});

export const deleteShippingMethod = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError("Invalid Method Shipping", 400);

  const deleted = await ShippingMethod.findByIdAndDelete(id);
  if (!deleted) throw new CustomError("Method not found", 404);
  res.status(200).json({ message: "Deleted" });
});
