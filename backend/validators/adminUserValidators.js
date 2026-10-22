
import { z } from "zod";

const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// PUT /api/admin/users/:userId/status
export const adminUserParamsSchema = z.object({
    userId: objectIdSchema
}).strict();

// PUT /api/admin/sellers/:sellerId/status
export const adminSellerParamsSchema = z.object({
    sellerId: objectIdSchema
}).strict();

// Request body for customer and seller status updates
export const updateAccountStatusSchema = z.object({
    isActive: z.boolean()
}).strict();

export const adminProductParamsSchema = z.object({
    productId: objectIdSchema
}).strict();