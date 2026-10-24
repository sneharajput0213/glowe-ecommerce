
import { z } from "zod";

const shippingAddressSchema = z.object({
    phone: z.string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Enter a valid 10-digit Indian mobile number"
        ),
        
    address: z.string()
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(300, "Address cannot exceed 300 characters"),

    city: z.string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .max(100, "City cannot exceed 100 characters"),

    state: z.string()
        .trim()
        .min(2, "State must be at least 2 characters")
        .max(100, "State cannot exceed 100 characters"),

    postalCode: z.string()
        .trim()
        .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code"),

    country: z.literal("India")
        .default("India")
}).strict();

export const createOrderSchema = z.object({
    shippingAddress: shippingAddressSchema
}).strict();

const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const orderIdParamsSchema = z.object({
    orderId: objectIdSchema
}).strict();

export const orderItemParamsSchema = z.object({
    orderId: objectIdSchema,
    itemId: objectIdSchema
}).strict();

export const updateSellerOrderItemStatusSchema = z.object({
    fulfillmentStatus: z.enum([
        "processing",
        "shipped",
        "delivered"
    ])
}).strict();

export const updateAdminOrderStatusSchema = z.object({
    orderStatus: z.enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ])
}).strict();
