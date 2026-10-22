
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import { restoreOrderStock } from "./inventoryService.js";

/**
 * Applies a transaction result already verified with PayU.
 *
 * This function does NOT call PayU.
 * The caller must independently verify the transaction first.
 */
export const applyVerifiedPayment = async ({
    txnid,
    transaction
}) => {
    if (!txnid || String(transaction?.txnid) !== txnid) {
        throw new Error("Invalid verified transaction");
    }

    const transactionStatus = String(
        transaction.status ?? ""
    ).toLowerCase();

    if (!["success", "failure", "failed"].includes(transactionStatus)) {
        return {
            type: "pending",
            message: "Payment has not reached a final state"
        };
    }

    const verifiedAmount = Number(transaction.amt);

    if (!Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
        throw new Error("Invalid verified payment amount");
    }

    if (transactionStatus === "success" && !transaction.mihpayid) {
        return {
            type: "pending",
            message: "Verified PayU payment ID is unavailable"
        };
    }

    const session = await mongoose.startSession();

    try {
        let result = {
            type: "review",
            message: "Payment requires review"
        };

        await session.withTransaction(async () => {
            const order = await Order.findOne({
                "paymentAttempts.txnid": txnid
            }).session(session);

            if (!order) {
                throw new Error("Payment attempt not found");
            }

            if (
                !Number.isFinite(Number(order.totalPrice)) ||
                Number(order.totalPrice).toFixed(2) !==
                    verifiedAmount.toFixed(2)
            ) {
                throw new Error("Verified payment amount mismatch");
            }

            const attempt = order.paymentAttempts.find(
                item => item.txnid === txnid
            );

            if (!attempt) {
                throw new Error("Payment attempt not found");
            }

            const isCurrentTransaction =
                order.paymentTxnId === txnid;

            if (transactionStatus === "success") {
                const payuId = String(transaction.mihpayid);

                if (attempt.payuId && attempt.payuId !== payuId) {
                    throw new Error("Conflicting PayU payment ID");
                }

                if (
                    attempt.capturedAmount != null &&
                    Number(attempt.capturedAmount).toFixed(2) !==
                        verifiedAmount.toFixed(2)
                ) {
                    throw new Error("Conflicting captured amount");
                }

                if (attempt.status === "success") {
                    if (!attempt.payuId) {
                        attempt.payuId = payuId;
                    }

                    if (attempt.capturedAmount == null) {
                        attempt.capturedAmount = verifiedAmount;
                    }

                    const requiresRefund = [
                        "required",
                        "pending",
                        "refunded",
                        "failed"
                    ].includes(attempt.refundStatus);

                    if (requiresRefund) {
                        result = {
                            type: "refund",
                            message: "Payment requires refund review"
                        };
                    } else if (
                        order.paymentStatus === "paid" &&
                        order.paymentPayuId === payuId
                    ) {
                        result = {
                            type: "success",
                            message: "Payment already confirmed"
                        };
                    } else {
                        result = {
                            type: "review",
                            message: "Payment requires manual review"
                        };
                    }

                    await order.save({ session });
                    return;
                }

                attempt.status = "success";
                attempt.payuId = payuId;
                attempt.capturedAmount = verifiedAmount;

                const canConfirmPayment =
                    isCurrentTransaction &&
                    order.paymentStatus !== "paid" &&
                    order.orderStatus !== "cancelled" &&
                    order.inventoryStatus === "reserved";

                if (canConfirmPayment) {
                    order.paymentStatus = "paid";
                    order.paymentPayuId = payuId;
                    order.paymentTxnId = null;
                    order.paymentInitiatedAt = null;

                    result = {
                        type: "success",
                        message: "Payment successful"
                    };
                } else {
                    if (
                        !attempt.refundStatus ||
                        attempt.refundStatus === "none"
                    ) {
                        attempt.refundStatus = "required";
                    }

                    if (isCurrentTransaction) {
                        order.paymentTxnId = null;
                        order.paymentInitiatedAt = null;
                    }

                    result = {
                        type: "refund",
                        message: "Payment received but refund review required"
                    };
                }
            } else {
                if (attempt.status === "success") {
                    result = {
                        type: "review",
                        message: "Conflicting payment result requires review"
                    };
                    return;
                }

                if (attempt.status === "failed") {
                    result = {
                        type: "failure",
                        message: "Payment already failed"
                    };
                    return;
                }

                attempt.status = "failed";

                if (isCurrentTransaction) {
                    if (
                        order.orderStatus !== "cancelled" &&
                        order.inventoryStatus === "reserved"
                    ) {
                        const restored = await restoreOrderStock(
                            order._id,
                            session
                        );

                        if (!restored) {
                            throw new Error("Unable to restore inventory");
                        }

                        order.inventoryStatus = "restored";
                    }

                    if (order.paymentStatus !== "paid") {
                        order.paymentStatus = "failed";
                    }

                    order.paymentTxnId = null;
                    order.paymentInitiatedAt = null;
                }

                result = {
                    type: "failure",
                    message: "Payment failed"
                };
            }

            await order.save({ session });
        });

        return result;
    } finally {
        await session.endSession();
    }
};
