import { z } from "zod";

// Re-usable fields
const nameField = z.string().min(1, "Name is required");
const feeField = z
  .number({ required_error: "Fee is required" })
  .nonnegative("Fee must be 0 or greater");
const estimatedDaysField = z
  .number()
  .int("Estimated days must be an integer")
  .positive("Estimated days must be greater than 0")
  .optional();
const isActiveField = z.boolean().optional();

// Create shipping method validation schema
export const createShippingMethodSchema = z.object({
  name: nameField,
  fee: feeField,
  estimatedDays: estimatedDaysField,
});

// Update shipping method validation schema  – all optional but at least one field required
export const updateShippingMethodSchema = z
  .object({
    name: nameField.optional(),
    fee: feeField.optional(),
    estimatedDays: estimatedDaysField,
    isActive: isActiveField,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.fee !== undefined ||
      data.estimatedDays !== undefined ||
      data.isActive !== undefined,
    { message: "Provide at least one field to update" }
  );
