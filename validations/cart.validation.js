import { z } from "zod";

//  Add Product to Cart
export const addToCartSchema = z.object({
  quantity: z
    .number({
      required_error: "Quantity must be a number",
      invalid_type_error: "Quantity must be a number",
    })
    .int()
    .min(1, { message: "Quantity must be at least 1" })
    .default(1),

  sizes: z
    .string({
      required_error: "Size is required",
      invalid_type_error: "Size must be a string",
    })
    .min(1, { message: "Size cannot be empty" })
});

// Update Product Quantity
export const updateQuantitySchema = z.object({
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int()
    .min(1, { message: "Quantity must be at least 1" }),
});
