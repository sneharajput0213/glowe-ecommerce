
import { z } from "zod";

const productIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID");

const quantitySchema = z.number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1");

// POST /api/cart
export const addToCartSchema = z.object({
  product: productIdSchema,
  quantity: quantitySchema
}).strict();

// PUT /api/cart/:productId
export const updateCartItemSchema = z.object({
  quantity: quantitySchema
}).strict();

// Route parameter validation
export const cartProductParamsSchema = z.object({
  productId: productIdSchema
}).strict();
