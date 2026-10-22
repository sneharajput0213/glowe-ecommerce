import axios from "axios";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { restoreOrderStock, reserveOrderStock } from "../services/inventoryService.js";
import { applyVerifiedPayment } from "../services/paymentReconciliationService.js";

const verifyPayUTransaction = async (txnid) => {

    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    const hashString = `${key}|verify_payment|${txnid}|${salt}`;

    const hash = crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");

    const data = new URLSearchParams({
        key,
        command: "verify_payment",
        var1: txnid,
        hash
    });

    const response = await axios.post(
        "https://test.payu.in/merchant/postservice?form=2",
        data.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000
        }
    );

    return response.data;
};

export const createPayment = async (req, res) => {
    const { orderId } = req.validatedBody;
    const userId = req.user.id;

    if (!orderId) {
        return res.status(400).json({
            message: "Please provide order ID"
        });
    }

    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
        return res.status(500).json({
            message: "PayU credentials are missing"
        });
    }

    const session = await mongoose.startSession();

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.phone) {
            return res.status(400).json({
                message: "Please add your phone number before making payment"
            });
        }

        const txnid = crypto.randomBytes(12).toString("hex");
        let paymentOrder = null;
        let rejection = null;

        await session.withTransaction(async () => {
            const order = await Order.findOne({
                _id: orderId,
                user: userId
            }).session(session);

            if (!order) {
                rejection = {
                    status: 404,
                    message: "Order not found"
                };
                return;
            }

            if (order.paymentStatus === "paid") {
                rejection = {
                    status: 400,
                    message: "Order is already paid"
                };
                return;
            }

            if (order.paymentTxnId) {
                rejection = {
                    status: 400,
                    message: "A payment attempt is already in progress"
                };
                return;
            }

            if (order.orderStatus === "cancelled") {
                rejection = {
                    status: 400,
                    message: "Cannot pay for a cancelled order"
                };
                return;
            }

            if (order.paymentStatus === "failed") {
                const reserved = await reserveOrderStock(order._id, session);

                if (!reserved) {
                    rejection = {
                        status: 400,
                        message: "Unable to reserve stock for payment retry"
                    };
                    return;
                }

                order.inventoryStatus = "reserved";
                order.paymentStatus = "pending";
            }

            if (order.inventoryStatus !== "reserved") {
                rejection = {
                    status: 400,
                    message: "Order inventory is not reserved"
                };
                return;
            }

            order.paymentTxnId = txnid;
            order.paymentInitiatedAt = new Date();

            order.paymentAttempts.push({
                txnid,
                status: "initiated",
                initiatedAt: new Date()
            });

            await order.save({ session });

            paymentOrder = order;
        });

        if (rejection) {
            return res.status(rejection.status).json({
                message: rejection.message
            });
        }

        const amount = paymentOrder.totalPrice.toFixed(2);
        const productinfo = `Glowe Order ${paymentOrder._id}`;
        const firstname = user.name.trim().split(" ")[0];
        const email = user.email;
        const phone = user.phone;

        const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

        const hash = crypto
            .createHash("sha512")
            .update(hashString)
            .digest("hex");

        const paymentData = {
            key,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            phone,
            surl: process.env.PAYU_SUCCESS_URL,
            furl: process.env.PAYU_FAILURE_URL,
            hash
        };

        return res.status(200).json({
            message: "Payment initiated successfully",
            action: "https://test.payu.in/_payment",
            paymentData
        });

    } catch (error) {
    if (error.message?.startsWith("Insufficient stock for")) {
        return res.status(409).json({
            message: error.message
        });
    }

    console.error("Payment initiation error:", error.message);

    return res.status(500).json({
        message: "Unable to initiate payment"
    });
    } finally {
        await session.endSession();
    }
};

export const handlePayUResponse = async (req, res) => {
    const {
        status,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        key,
        hash,
        udf1 = "",
        udf2 = "",
        udf3 = "",
        udf4 = "",
        udf5 = "",
        additionalCharges
    } = req.body ?? {};

    try {
        if (
            typeof status !== "string" ||
            typeof txnid !== "string" ||
            typeof amount !== "string" ||
            typeof hash !== "string" ||
            typeof key !== "string" ||
            typeof productinfo !== "string" ||
            typeof firstname !== "string" ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid payment response"
            });
        }

        if (
            !status ||
            !txnid ||
            !amount ||
            !hash ||
            !key
        ) {
            return res.status(400).json({
                message: "Missing payment details"
            });
        }

        if (key !== process.env.PAYU_KEY) {
            return res.status(400).json({
                message: "Invalid merchant key"
            });
        }

        if (!/^[a-fA-F0-9]{128}$/.test(hash)) {
            return res.status(400).json({
                message: "Invalid payment hash"
            });
        }

        const salt = process.env.PAYU_SALT;

        if (!salt) {
            return res.status(500).json({
                message: "Payment configuration missing"
            });
        }

        const udfValues = [
            udf1, udf2, udf3, udf4, udf5
        ];

        if (
            udfValues.some(value => typeof value !== "string") ||
            (additionalCharges != null &&
                typeof additionalCharges !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid payment fields"
            });
        }

        const hashString = additionalCharges
            ? `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
            : `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

        const calculatedHash = crypto
            .createHash("sha512")
            .update(hashString)
            .digest("hex");

        const receivedHash = Buffer.from(hash, "hex");
        const expectedHash = Buffer.from(calculatedHash, "hex");

        if (!crypto.timingSafeEqual(receivedHash, expectedHash)) {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }

        const order = await Order.findOne({
            "paymentAttempts.txnid": txnid
        });

        if (!order) {
            return res.status(404).json({
                message: "Payment attempt not found"
            });
        }

        const expectedProductInfo = `Glowe Order ${order._id}`;

        const callbackAmount = Number(amount);
        const orderAmount = Number(order.totalPrice);

        if (
            !Number.isFinite(callbackAmount) ||
            !Number.isFinite(orderAmount) ||
            callbackAmount.toFixed(2) !==
                orderAmount.toFixed(2) ||
            productinfo !== expectedProductInfo
        ) {
            return res.status(400).json({
                message: "Payment details do not match the order"
            });
        }

        // Independently verify with PayU.
        const verification = await verifyPayUTransaction(txnid);

        if (Number(verification?.status) !== 1) {
            return res.status(400).json({
                message: "Unable to verify payment with PayU"
            });
        }

        const transaction =
            verification.transaction_details?.[txnid];

        if (
            !transaction ||
            String(transaction.txnid) !== txnid
        ) {
            return res.status(400).json({
                message: "Verified transaction not found"
            });
        }

        const verifiedAmount = Number(transaction.amt);

        if (
            !Number.isFinite(verifiedAmount) ||
            verifiedAmount.toFixed(2) !==
                orderAmount.toFixed(2)
        ) {
            return res.status(400).json({
                message: "Verified payment amount mismatch"
            });
        }

        const result = await applyVerifiedPayment({
            txnid,
            transaction
        });

        if (result.type === "pending") {
            return res.status(202).json({
                message: result.message
            });
        }

        const resultType = result.type;

        const successUrl =
            process.env.FRONTEND_PAYMENT_SUCCESS_URL;

        const failureUrl =
            process.env.FRONTEND_PAYMENT_FAILURE_URL;

        const frontendUrl =
            resultType === "success"
                ? successUrl
                : failureUrl;

        if (!frontendUrl) {
            return res.status(500).json({
                message: "Payment redirect URL is not configured"
            });
        }

        const redirectUrl = new URL(frontendUrl);

        redirectUrl.searchParams.set(
            "orderId",
            order._id.toString()
        );

        redirectUrl.searchParams.set(
            "payment",
            resultType
        );

        return res.redirect(303, redirectUrl.toString());

    } catch (error) {
        console.error("PayU callback processing error:", error.message);

        return res.status(500).json({
            message: "Payment processing failed"
        });
    }
};


export const reconcilePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const txnid = order.paymentTxnId;

        if (!txnid) {
            return res.status(200).json({
                message: "No active payment requires reconciliation",
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus
            });
        }

        const attempt = order.paymentAttempts.find(
            item => item.txnid === txnid
        );

        if (!attempt) {
            console.error(
                "Active payment attempt missing:",
                order._id.toString()
            );

            return res.status(409).json({
                message: "Payment records require review"
            });
        }

        const verification = await verifyPayUTransaction(txnid);

        if (Number(verification?.status) !== 1) {
            return res.status(202).json({
                message: "Unable to confirm payment status yet",
                paymentStatus: "pending"
            });
        }

        const transaction =
            verification.transaction_details?.[txnid];

        if (
            !transaction ||
            String(transaction.txnid) !== txnid
        ) {
            return res.status(202).json({
                message: "PayU transaction result is not available yet",
                paymentStatus: "pending"
            });
        }

        const result = await applyVerifiedPayment({
            txnid,
            transaction
        });

        const updatedOrder = await Order.findOne({
            _id: orderId,
            user: userId
        }).select(
            "paymentStatus orderStatus inventoryStatus paymentTxnId"
        );

        return res.status(
            result.type === "pending" ? 202 : 200
        ).json({
            message: result.message,
            result: result.type,
            paymentStatus: updatedOrder.paymentStatus,
            orderStatus: updatedOrder.orderStatus,
            inventoryStatus: updatedOrder.inventoryStatus
        });

    } catch (error) {
        console.error(
            "Payment reconciliation error:",
            error.message
        );

        return res.status(503).json({
            message: "Payment verification is temporarily unavailable. Please try again later."
        });
    }
};
