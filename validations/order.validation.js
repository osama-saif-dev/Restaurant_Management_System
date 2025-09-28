import { z } from "zod";

// Allowed values
const paymentMethods = ["COD", "Card"];
const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

// Shipping address object
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(5, "Phone number is required"),
});

// Create Order validation
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethodId: z.string().min(1, "Shipping method is required"),
  paymentMethod: z.enum(paymentMethods).optional().default("COD"),
});

// Admin update status validation
export const updateOrderStatusSchema = z.object({
  newStatus: z.enum(orderStatuses, {
    required_error: "New status is required",
  }),
});
