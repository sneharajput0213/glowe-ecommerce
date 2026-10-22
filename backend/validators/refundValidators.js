import { z } from "zod";

export const refundOrderParamsSchema = z.object({
    orderId: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid order ID"
    )
}).strict();

export const initiateRefundSchema = z.object({
    txnid: z.string()
        .trim()
        .min(1, "Transaction ID is required")
        .max(100, "Transaction ID is too long"),

    amount: z.number()
        .finite()
        .positive("Refund amount must be greater than zero")
        .refine(
            (amount) =>
                Number.isSafeInteger(Math.round(amount * 100)) &&
                Math.abs(
                    amount * 100 - Math.round(amount * 100)
                ) < 1e-8,
            "Refund amount cannot have more than two decimal places"
        )
}).strict();

export const refundStatusParamsSchema = z.object({
    orderId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID"),

    txnid: z.string()
        .trim()
        .min(1, "Transaction ID is required")
        .max(100, "Transaction ID is too long")
}).strict();