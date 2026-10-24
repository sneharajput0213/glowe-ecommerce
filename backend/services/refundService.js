import Order from "../models/orderModel.js";
import axios from "axios";
import crypto from "crypto";

const payURequest = async (data) => {
    const body = new URLSearchParams(data);

    const response = await axios.post(
        "https://test.payu.in/merchant/postservice.php?form=2",
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 15000
        }
    );

    return response.data;
};

export const getCancellationRefundDetails = async (orderId) => {
    const order = await Order.findOne({
        _id: orderId,
        paymentStatus: "paid",
        orderStatus: "cancellation_requested"
    });

    if (!order) {
        throw new Error("Eligible cancellation request not found");
    }

    const attempt = order.paymentAttempts.find(
        (item) =>
            item.status === "success" &&
            item.payuId === order.paymentPayuId
    );

    if (!attempt || !attempt.payuId) {
        throw new Error("Verified successful payment not found");
    }

    const amount = Number(attempt.capturedAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid captured payment amount");
    }

    if (
        Math.round(amount * 100) !==
        Math.round(Number(order.totalPrice) * 100)
    ) {
        throw new Error("Captured amount does not match order total");
    }

    return {
        orderId: order._id,
        txnid: attempt.txnid,
        payuId: attempt.payuId,
        amount
    };
};

export const initiateOrderRefund = async ({
    orderId,
    txnid,
    amount,
    mode = "admin"
}) => {
    if (!["admin", "customer_cancellation"].includes(mode)) {
        throw new Error("Invalid refund mode");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return { status: 404, message: "Order not found" };
    }

    const attempt = order.paymentAttempts.find(
        item => item.txnid === txnid
    );

    if (!attempt || attempt.status !== "success" || !attempt.payuId) {
        return {
            status: 400,
            message: "Verified successful payment required"
        };
    }

    const capturedAmount = Number(attempt.capturedAmount);

    if (
        attempt.capturedAmount == null ||
        !Number.isFinite(capturedAmount) ||
        capturedAmount <= 0 ||
        !Number.isFinite(Number(amount)) ||
        Math.round(Number(amount) * 100) !==
            Math.round(capturedAmount * 100)
    ) {
        return {
            status: 400,
            message: "Refund must equal verified captured amount"
        };
    }

    const acceptedPayment =
        order.paymentStatus === "paid" &&
        order.paymentPayuId === attempt.payuId;

    const unexpectedPayment =
        attempt.refundStatus === "required";

    if (mode === "customer_cancellation") {
        if (
            !acceptedPayment ||
            order.orderStatus !== "cancellation_requested"
        ) {
            return {
                status: 409,
                message: "Order is not eligible for cancellation refund"
            };
        }
    } else if (!acceptedPayment && !unexpectedPayment) {
        return {
            status: 400,
            message: "Payment is not eligible for refund"
        };
    }

    if (
        acceptedPayment &&
        (
            ["cancelled", "shipped", "delivered"].includes(order.orderStatus) ||
            order.items.some(item =>
                ["shipped", "delivered"].includes(item.fulfillmentStatus)
            )
        )
    ) {
        return {
            status: 400,
            message: "Refund requires a separate return workflow"
        };
    }

    if (
        !["none", "required"].includes(attempt.refundStatus) ||
        attempt.refundToken != null ||
        attempt.refundRequestId != null
    ) {
        return {
            status: 409,
            message: "Refund already initiated or requires reconciliation"
        };
    }

    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
        return {
            status: 500,
            message: "PayU credentials are missing"
        };
    }

    const token = crypto.randomBytes(13).toString("hex").slice(0, 25);
    const now = new Date();

    const eligibility =
        mode === "customer_cancellation"
            ? {
                paymentStatus: "paid",
                paymentPayuId: attempt.payuId,
                orderStatus: "cancellation_requested"
            }
            : {
                $or: [
                    {
                        paymentStatus: "paid",
                        paymentPayuId: attempt.payuId,
                        orderStatus: {
                            $nin: ["cancelled", "shipped", "delivered"]
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
            };

    const claimedOrder = await Order.findOneAndUpdate(
        {
            _id: orderId,
            ...eligibility,
            items: {
                $not: {
                    $elemMatch: {
                        fulfillmentStatus: {
                            $in: ["shipped", "delivered"]
                        }
                    }
                }
            },
            paymentAttempts: {
                $elemMatch: {
                    txnid,
                    payuId: attempt.payuId,
                    status: "success",
                    capturedAmount,
                    refundStatus: { $in: ["none", "required"] },
                    refundToken: null,
                    refundRequestId: null
                }
            }
        },
        {
            $set: {
                "paymentAttempts.$[target].refundStatus": "pending",
                "paymentAttempts.$[target].refundToken": token,
                "paymentAttempts.$[target].refundAmount": capturedAmount,
                "paymentAttempts.$[target].refundInitiatedAt": now,
                ...(mode === "customer_cancellation"
                    ? {
                        refundStatus: "pending",
                        refundAmount: capturedAmount,
                        refundInitiatedAt: now
                    }
                    : {})
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
        return {
            status: 409,
            message: "Refund already claimed or eligibility changed"
        };
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
        return {
            status: 202,
            message: "PayU outcome uncertain. Reconciliation required.",
            refundStatus: "pending"
        };
    }

    const requestId =
        refundResponse?.request_id ??
        refundResponse?.txn_update_id;

    if (Number(refundResponse?.status) !== 1 || !requestId) {
        return {
            status: 202,
            message: "PayU initiation unconfirmed. Reconciliation required.",
            refundStatus: "pending"
        };
    }

    const update = {
        "paymentAttempts.$.refundRequestId": String(requestId)
    };

    if (mode === "customer_cancellation") {
        update.refundRequestId = String(requestId);
    }

    const result = await Order.updateOne(
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
        { $set: update }
    );

    if (result.modifiedCount !== 1) {
        return {
            status: 202,
            message: "PayU accepted refund; database reconciliation required.",
            refundStatus: "pending",
            refundRequestId: String(requestId)
        };
    }

    return {
        status: 200,
        message: "Refund request submitted to PayU",
        refundStatus: "pending",
        refundAmount: capturedAmount,
        refundRequestId: String(requestId)
    };
};