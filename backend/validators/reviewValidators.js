
import { z } from "zod";

const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const ratingSchema = z.number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5");

const commentSchema = z.string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters");

// POST /api/reviews
export const createReviewSchema = z.object({
    product: objectIdSchema,
    rating: ratingSchema,
    comment: commentSchema.optional().default("")
}).strict();

// PUT /api/reviews/:reviewId
export const updateReviewSchema = z.object({
    rating: ratingSchema,
    comment: commentSchema.optional()
}).strict();

// GET /api/reviews/product/:productId
export const productReviewParamsSchema = z.object({
    productId: objectIdSchema
}).strict();

// PUT and DELETE /api/reviews/:reviewId
export const reviewIdParamsSchema = z.object({
    reviewId: objectIdSchema
}).strict();
