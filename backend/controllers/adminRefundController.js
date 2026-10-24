import axios from "axios";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import { initiateOrderRefund } from "../services/refundService.js";
import mongoose from "mongoose";
import { restoreOrderStock } from "../services/inventoryService.js";

const payURequest = async (data) => {
    const response = await axios.post(
        "https://test.payu.in/merchant/postservice.php?form=2",
        new URLSearchParams(data).toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return response.data;
};

export const initiateRefund = async (req, res) => {
    try {
        const { orderId } = req.validatedParams;
        const { txnid, amount } = req.validatedBody;

        const result = await initiateOrderRefund({
            orderId,
            txnid,
            amount,
            mode: "admin"
        });

        return res.status(result.status).json({
            message: result.message,
            ...(result.refundStatus && {
                refundStatus: result.refundStatus
            }),
            ...(result.refundAmount != null && {
                refundAmount: result.refundAmount
            }),
            ...(result.refundRequestId && {
                refundRequestId: result.refundRequestId
            })
        });

    } catch (error) {
        console.error("Refund initiation error:", error.message);

        return res.status(500).json({
            message: "Refund initiation failed"
        });
    }
};

export const checkRefundStatus = async (req, res) => {
    try {
        const { orderId, txnid } = req.validatedParams;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const attempt = order.paymentAttempts.find(
            item => item.txnid === txnid
        );

        if (!attempt) {
            return res.status(404).json({
                message: "Payment attempt not found"
            });
        }

        if (!attempt.refundRequestId) {
            return res.status(202).json({
                message: attempt.refundToken
                    ? "Refund outcome uncertain. Manual PayU reconciliation required."
                    : "No PayU refund request ID recorded.",
                refundStatus: attempt.refundStatus,
                txnid,
                requiresManualReview: Boolean(attempt.refundToken)
            });
        }

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        if (!key || !salt) {
            return res.status(500).json({
                message: "PayU credentials are missing"
            });
        }

        const requestId = String(attempt.refundRequestId);
        const command = "check_action_status";

        const hash = crypto
            .createHash("sha512")
            .update(`${key}|${command}|${requestId}|${salt}`)
            .digest("hex");

        let refundResponse;

        try {
            refundResponse = await payURequest({
                key,
                command,
                var1: requestId,
                hash
            });
        } catch (error) {
            return res.status(202).json({
                message: "Unable to verify refund with PayU",
                refundStatus: attempt.refundStatus,
                txnid
            });
        }

        console.log(
            "PayU refund status response:",
            JSON.stringify(refundResponse, null, 2)
        );

        if (Number(refundResponse?.status) !== 1) {
            return res.status(202).json({
                message: "PayU refund status is unavailable",
                refundStatus: attempt.refundStatus,
                txnid
            });
        }

        const outer =
            refundResponse.transaction_details?.[requestId];

        const details =
            outer?.[requestId] ?? outer;

        if (
            !details ||
            typeof details !== "object" ||
            Array.isArray(details)
        ) {
            return res.status(202).json({
                message: "Unrecognized PayU refund response",
                refundStatus: attempt.refundStatus,
                txnid
            });
        }

        // Verify that PayU returned the selected refund.
        if (
            String(details.request_id ?? "") !== requestId ||
            String(details.mihpayid ?? "") !==
                String(attempt.payuId) ||
            String(details.action ?? "").toLowerCase() !== "refund"
        ) {
            return res.status(202).json({
                message: "PayU refund details did not match",
                refundStatus: attempt.refundStatus,
                txnid
            });
        }

        
const returnedToken = String(details.token ?? "");
const storedToken = String(attempt.refundToken ?? "");
console.log("TOKEN DEBUG:", {
    returnedLength: returnedToken.length,
    storedLength: storedToken.length,
    exactMatch: returnedToken === storedToken,
    prefixMatch: storedToken.startsWith(returnedToken),
    first25Match: returnedToken === storedToken.slice(0, 25)
});

// Compatibility for this existing sandbox refund.
// PayU returned the first 25 characters of the stored token.
const tokenMatches =
    returnedToken.length === 23 &&
    storedToken.length === 32 &&
    storedToken.startsWith(returnedToken);

if (!tokenMatches) {
    return res.status(202).json({
        message: "Refund token mismatch. Manual review required.",
        refundStatus: attempt.refundStatus,
        txnid
    });
}

// Also verify the refunded amount.
const payUAmount = Number(details.amt);
const expectedAmount = Number(attempt.refundAmount);

if (
    !Number.isFinite(payUAmount) ||
    !Number.isFinite(expectedAmount) ||
    Math.round(payUAmount * 100) !==
        Math.round(expectedAmount * 100)
) {
    return res.status(202).json({
        message: "PayU refund amount mismatch",
        refundStatus: attempt.refundStatus,
        txnid
    });
}

        const payUStatus = String(
            details.status ?? ""
        ).trim().toLowerCase();

        
if (
    [
        "pending",
        "queued",
        "in progress",
        "requested",
        "od_hit"
    ].includes(payUStatus)
) {
    return res.status(200).json({
        message: "Refund is still being processed by PayU",
        txnid,
        refundStatus: "pending",
        refundRequestId: requestId,
        payUStatus
    });
}


        let newStatus = "pending";

        if (payUStatus === "success") {
            newStatus = "refunded";
        } else if (payUStatus === "failure") {
            newStatus = "failed";
        } else if (
            ![
                "queued",
                "in progress",
                "requested",
                "od_hit"
            ].includes(payUStatus)
        ) {
            return res.status(202).json({
                message: "Unknown PayU refund status",
                refundStatus: attempt.refundStatus,
                payUStatus,
                txnid
            });
        }

        // Finalize the verified refund atomically.
        const session = await mongoose.startSession();

        try {
            let finalStatus = newStatus;
            let finalizedOrder = null;

            await session.withTransaction(async () => {
                const currentOrder = await Order.findOne({
                    _id: orderId,
                    paymentAttempts: {
                        $elemMatch: {
                            txnid,
                            refundRequestId: requestId,
                            refundToken: attempt.refundToken
                        }
                    }
                }).session(session);

                if (!currentOrder) {
                    throw new Error("Refund operation changed");
                }

                const currentAttempt = currentOrder.paymentAttempts.find(
                    item =>
                        item.txnid === txnid &&
                        String(item.refundRequestId) === requestId
                );

                if (!currentAttempt) {
                    throw new Error("Refund attempt not found");
                }

                if (currentAttempt.refundStatus === "refunded") {
                    finalStatus = "refunded";

                    if (
                        currentOrder.orderStatus === "cancellation_requested" &&
                        currentOrder.paymentPayuId === currentAttempt.payuId
                    ) {
                        currentOrder.orderStatus = "cancelled";
                        currentOrder.refundStatus = "refunded";
                        currentOrder.refundRequestId = requestId;
                        currentOrder.refundAmount = Number(currentAttempt.refundAmount);

                        await currentOrder.save({ session });

                        await restoreOrderStock(orderId, session);
                    }

                    finalizedOrder = currentOrder;
                    return;
                }

                if (currentAttempt.refundStatus !== "pending") {
                    throw new Error("Refund is no longer pending");
                }

                const isCustomerCancellation =
                    currentOrder.orderStatus === "cancellation_requested" &&
                    currentOrder.paymentPayuId === currentAttempt.payuId;

                currentAttempt.refundStatus = newStatus;

                if (isCustomerCancellation) {
                    currentOrder.refundStatus = newStatus;
                    currentOrder.refundRequestId = requestId;
                    currentOrder.refundAmount = Number(
                        currentAttempt.refundAmount
                    );

                    if (newStatus === "refunded") {
                        currentOrder.orderStatus = "cancelled";
                    }
                }

                await currentOrder.save({ session });

                if (isCustomerCancellation && newStatus === "refunded") {
                    const restored = await restoreOrderStock(
                        orderId,
                        session
                    );

                    if (
                        !restored &&
                        currentOrder.inventoryStatus !== "restored"
                    ) {
                        throw new Error("Unable to restore order stock");
                    }
                }

                finalizedOrder = currentOrder;
            });

            return res.status(200).json({
                message:
                    finalStatus === "refunded"
                        ? "Refund confirmed by PayU"
                        : "Refund status checked",
                txnid,
                refundStatus: finalStatus,
                refundAmount: attempt.refundAmount,
                refundRequestId: requestId,
                payUStatus,
                orderStatus: finalizedOrder?.orderStatus
            });

        } catch (error) {
            console.error(
                "Refund finalization error:",
                error.message
            );

            return res.status(409).json({
                message:
                    "Refund verification succeeded, but order finalization requires reconciliation."
            });
        } finally {
            await session.endSession();
        }

    } catch (error) {
    console.error("Refund status check error:", error);

    return res.status(500).json({
        message: "Refund status check failed"
    });
}
};
