import { z } from "zod";

// Create table validation
export const createTableSchema = z.object({
  tableNumber: z
    .number({ invalid_type_error: "Table number must be a number" })
    .int()
    .min(1, "Table number must be at least 1"),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int()
    .min(1, "Capacity must be at least 1"),
  location: z.enum(["indoor", "outdoor"], {
    errorMap: () => ({
      message: "Location must be either 'indoor' or 'outdoor'",
    }),
  }),
  image: z.string().url().optional().nullable(),
});

// Update table validation
export const updateTableSchema = z.object({
  tableNumber: z
    .number({ invalid_type_error: "Table number must be a number" })
    .int()
    .min(1)
    .optional(),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int()
    .min(1)
    .optional(),
  location: z.enum(["indoor", "outdoor"]).optional(),
  image: z.string().url().optional().nullable(),
});
