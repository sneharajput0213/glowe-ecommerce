import axios from "axios";
import crypto from "crypto";
import Order from "../models/orderModel.js";


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

        if (attempt.status !== "success" || !attempt.payuId) {
            return res.status(400).json({
                message: "Verified successful payment required"
            });
        }

        const capturedAmount = Number(attempt.capturedAmount);

        if (
            attempt.capturedAmount == null ||
            !Number.isFinite(capturedAmount) ||
            capturedAmount <= 0
        ) {
            return res.status(409).json({
                message:
                    "Verified captured amount is missing. Reconcile payment before refunding."
            });
        }

        // Only full-payment refunds are supported.
        if (
            !Number.isFinite(amount) ||
            Math.round(amount * 100) !==
                Math.round(capturedAmount * 100)
        ) {
            return res.status(400).json({
                message: "Refund must equal verified captured amount"
            });
        }

        const isAcceptedPayment =
            order.paymentStatus === "paid" &&
            order.paymentPayuId === attempt.payuId;

        const isUnexpectedPayment =
            attempt.refundStatus === "required";

        if (!isAcceptedPayment && !isUnexpectedPayment) {
            return res.status(400).json({
                message: "Payment is not eligible for refund"
            });
        }

        if (
            isAcceptedPayment &&
            (
                order.orderStatus === "cancelled" ||
                order.items.some(item =>
                    ["shipped", "delivered"].includes(
                        item.fulfillmentStatus
                    )
                )
            )
        ) {
            return res.status(400).json({
                message: "Refund requires a separate return workflow"
            });
        }

        if (
            !["none", "required"].includes(
                attempt.refundStatus
            ) ||
            attempt.refundToken != null
        ) {
            return res.status(409).json({
                message: "Refund already initiated or requires reconciliation"
            });
        }

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        if (!key || !salt) {
            return res.status(500).json({
                message: "PayU credentials are missing"
            });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const now = new Date();

        // Claim the selected attempt and recheck
        // eligibility in the same atomic operation.
        const claimedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,

                $and: [
                    {
                        $or: [
                            {
                                paymentStatus: "paid",
                                paymentPayuId: attempt.payuId,
                                orderStatus: { $ne: "cancelled" },
                                items: {
                                    $not: {
                                        $elemMatch: {
                                            fulfillmentStatus: {
                                                $in: ["shipped", "delivered"]
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                paymentAttempts: {
                                    $elemMatch: {
                                        txnid,
                                        payuId: attempt.payuId,
                                        status: "success",
                                        refundStatus: "required",
                                        refundToken: null
                                    }
                                }
                            }
                        ]
                    },
                    {
                        paymentAttempts: {
                            $elemMatch: {
                                txnid,
                                payuId: attempt.payuId,
                                status: "success",
                                capturedAmount,
                                refundStatus: {
                                    $in: ["none", "required"]
                                },
                                refundToken: null,
                                refundRequestId: null
                            }
                        }
                    }
                ]
            },
            {
                $set: {
                    "paymentAttempts.$[target].refundStatus": "pending",
                    "paymentAttempts.$[target].refundToken": token,
                    "paymentAttempts.$[target].refundAmount": capturedAmount,
                    "paymentAttempts.$[target].refundInitiatedAt": now
                }
            },
            {
                new: true,
                arrayFilters: [
                    {
                        "target.txnid": txnid,
                        "target.payuId": attempt.payuId,
                        "target.status": "success",
                        "target.refundToken": null,
                        "target.refundRequestId": null,
                        "target.refundStatus": {
                            $in: ["none", "required"]
                        }
                    }
                ]
            }
        );

        if (!claimedOrder) {
            return res.status(409).json({
                message:
                    "Refund is already claimed or eligibility changed"
            });
        }

        const command = "cancel_refund_transaction";

        const hash = crypto
            .createHash("sha512")
            .update(`${key}|${command}|${attempt.payuId}|${salt}`)
            .digest("hex");

        let refundResponse;

        try {
            refundResponse = await payURequest({
                key,
                command,
                var1: attempt.payuId,
                var2: token,
                var3: capturedAmount.toFixed(2),
                hash
            });
        } catch (error) {
            // Never automatically unlock an uncertain refund.
            return res.status(202).json({
                message:
                    "PayU outcome uncertain. Reconciliation required.",
                txnid,
                refundStatus: "pending",
                refundToken: token
            });
        }

        const requestId =
            refundResponse?.request_id ??
            refundResponse?.txn_update_id;

        if (Number(refundResponse?.status) !== 1 || !requestId) {
            return res.status(202).json({
                message:
                    "PayU did not confirm refund initiation. Reconciliation required.",
                txnid,
                refundStatus: "pending",
                refundToken: token
            });
        }

        const updateResult = await Order.updateOne(
            {
                _id: orderId,
                paymentAttempts: {
                    $elemMatch: {
                        txnid,
                        refundToken: token,
                        refundStatus: "pending",
                        refundRequestId: null
                    }
                }
            },
            {
                $set: {
                    "paymentAttempts.$.refundRequestId":
                        String(requestId)
                }
            }
        );

        if (updateResult.modifiedCount !== 1) {
            return res.status(202).json({
                message:
                    "PayU accepted the refund but database confirmation requires reconciliation.",
                txnid,
                refundStatus: "pending",
                refundToken: token,
                refundRequestId: String(requestId)
            });
        }

        return res.status(200).json({
            message: "Refund request submitted to PayU",
            txnid,
            refundStatus: "pending",
            refundAmount: capturedAmount,
            refundRequestId: String(requestId)
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

        if (attempt.refundStatus === "refunded") {
            return res.status(200).json({
                message: "Refund already confirmed",
                refundStatus: "refunded",
                txnid
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
        const command = "check_action_status_txnid";

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

        if (
            details.token != null &&
            String(details.token) !== String(attempt.refundToken)
        ) {
            return res.status(202).json({
                message: "PayU refund token mismatch",
                refundStatus: attempt.refundStatus,
                txnid
            });
        }

        const payUStatus = String(
            details.status ?? ""
        ).trim().toLowerCase();

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

        // Never overwrite a different refund operation.
        const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                paymentAttempts: {
                    $elemMatch: {
                        txnid,
                        refundRequestId: requestId,
                        refundToken: attempt.refundToken,
                        refundStatus: "pending"
                    }
                }
            },
            {
                $set: {
                    "paymentAttempts.$.refundStatus": newStatus
                }
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(409).json({
                message: "Refund state changed. Refresh and check again."
            });
        }

        return res.status(200).json({
            message: "Refund status checked",
            txnid,
            refundStatus: newStatus,
            refundAmount: attempt.refundAmount,
            refundRequestId: requestId,
            payUStatus
        });

    } catch (error) {
        return res.status(500).json({
            message: "Refund status check failed"
        });
    }
};
