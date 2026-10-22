
import { z } from "zod";

const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID");

// POST /api/wishlist
export const addToWishlistSchema = z.object({
    product: objectIdSchema
}).strict();

// DELETE /api/wishlist/:productId
export const wishlistProductParamsSchema = z.object({
    productId: objectIdSchema
}).strict();
