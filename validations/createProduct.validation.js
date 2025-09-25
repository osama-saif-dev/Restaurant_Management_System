import z from "zod";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Product description is required'),
    price: z.string().min(1, 'Price must be a positive number'),
    subcategoryId: z.string().min(1, 'Subcategory ID is required'),
    offerId: z.string().optional(),
    quantity: z.string().min(1, 'Quantity must be a positive number'),
})