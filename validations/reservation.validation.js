import { z } from "zod";

// Updated status options
const reservationStatusEnum = z.enum([
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
]);

// Create reservation validation
export const createReservationSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(5, "Phone must be at least 5 characters")
    .max(15, "Phone must be at most 15 characters"),
  notes: z.string().optional().nullable(),
  startTime: z.preprocess(
    (arg) => new Date(arg),
    z.date({
      invalid_type_error: "Invalid start time",
    })
  ),
  endTime: z.preprocess(
    (arg) => new Date(arg),
    z.date({
      invalid_type_error: "Invalid end time",
    })
  ),
  status: reservationStatusEnum.optional(),
});

// Update reservation validation
export const updateReservationSchema = z.object({
  tableId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(5).max(15).optional(),
  notes: z.string().optional().nullable(),
  startTime: z.preprocess((arg) => new Date(arg), z.date()).optional(),
  endTime: z.preprocess((arg) => new Date(arg), z.date()).optional(),
  status: reservationStatusEnum.optional(),
});
