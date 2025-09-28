import { asyncHandler } from "../components/asyncHandler.js";
import ShippingMethod from "../models/ShippingMethod.js";
import CustomError from "../components/customErrors.js";
import { schemaResponse } from "../components/schemaResponse.js";
import mongoose from "mongoose";
import {
  updateShippingMethodSchema,
  createShippingMethodSchema,
} from "../validations/shippingMethods.validation.js";

/**
 * @desc Get all active shipping methods
 * @route GET /api/shipping-method
 * @access Public (active only) / Admin (all)
 */
export const listShippingMethods = asyncHandler(async (_req, res) => {
  const isAdmin = req.user?.role === "admin";

  const filter = isAdmin ? {} : { isActive: true };
  const methods = await ShippingMethod.find(filter).sort("-createdAt");

  res.status(200).json(methods);
});

/**
 * @desc Create a new shipping method
 * @route POST /api/shipping-method
 * @access Admin
 */
export const createShippingMethod = asyncHandler(async (req, res) => {
  const { name, fee, estimatedDays } = req.body;

  schemaResponse(createShippingMethodSchema, req.body);

  const method = await ShippingMethod.create({ name, fee, estimatedDays });
  res.status(201).json({ message: "Shipping method created", method });
});

/**
 * @desc Update a shipping method
 * @route PUT /api/shipping-method/:id
 * @access Admin
 */
export const updateShippingMethod = asyncHandler(async (req, res) => {
  const { name, fee, estimatedDays, isActive } = req.body;

  schemaResponse(updateShippingMethodSchema, req.body);

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

/**
 * @desc Delete a shipping method
 * @route DELETE /api/shipping-method/:id
 * @access Admin
 */
export const deleteShippingMethod = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError("Invalid Method Shipping", 400);

  const deleted = await ShippingMethod.findByIdAndDelete(id);
  if (!deleted) throw new CustomError("Method not found", 404);
  res.status(200).json({ message: "Deleted" });
});
