import Order from "../models/orderModel.js";
import { verifyPayUTransaction } from "./payuVerificationService.js";
import { applyVerifiedPayment } from "./paymentReconciliationService.js";
import mongoose from "mongoose";
import { restoreOrderStock } from "./inventoryService.js";

export const PAYMENT_EXPIRY_MINUTES = 30;

export const findExpiredPayments = async () => {
    const expiryTime = new Date(
        Date.now() - PAYMENT_EXPIRY_MINUTES * 60 * 1000
    );

    const expiredOrders = await Order.find({
        paymentStatus: "pending",
        inventoryStatus: "reserved",
        paymentTxnId: { $ne: null },
        paymentInitiatedAt: {
            $ne: null,
            $lte: expiryTime
        }
    }).select(
        "_id paymentTxnId paymentInitiatedAt"
    );

    return expiredOrders;
};

export const findAbandonedOrders = async () => {
    const expiryTime = new Date(
        Date.now() - PAYMENT_EXPIRY_MINUTES * 60 * 1000
    );

    const abandonedOrders = await Order.find({
        paymentStatus: "pending",
        inventoryStatus: "reserved",
        paymentTxnId: null,
        paymentInitiatedAt: null,
        "paymentAttempts.0": { $exists: false },
        createdAt: { $lte: expiryTime }
    }).select("_id createdAt");

    return abandonedOrders;
};

export const cancelAbandonedOrder = async (orderId) => {
    const session = await mongoose.startSession();

    try {
        let cancelled = false;

        await session.withTransaction(async () => {
            const expiryTime = new Date(
                Date.now() - PAYMENT_EXPIRY_MINUTES * 60 * 1000
            );

            const order = await Order.findOne({
                _id: orderId,
                paymentStatus: "pending",
                orderStatus: "pending",
                inventoryStatus: "reserved",
                paymentTxnId: null,
                paymentInitiatedAt: null,
                "paymentAttempts.0": { $exists: false },
                createdAt: { $lte: expiryTime }
            }).session(session);

            if (!order) return;

            const restored = await restoreOrderStock(
                order._id,
                session
            );

            if (!restored) return;

            order.inventoryStatus = "restored";
            order.orderStatus = "cancelled";

            await order.save({ session });

            cancelled = true;
        });

        return cancelled;
    } finally {
        await session.endSession();
    }
};

export const reconcileExpiredPayments = async () => {
    const expiredOrders = await findExpiredPayments();

    for (const order of expiredOrders) {
        try {
            const txnid = order.paymentTxnId;

            const verification = await verifyPayUTransaction(txnid);

            if (Number(verification?.status) !== 1) {
                console.warn(
                    `Unable to verify expired payment: ${txnid}`
                );
                continue;
            }

            const transaction =
                verification.transaction_details?.[txnid];

            if (!transaction) {
                console.warn(
                    `No verified transaction found: ${txnid}`
                );
                continue;
            }

            const result = await applyVerifiedPayment({
                txnid,
                transaction
            });

            console.log(
                `Payment ${txnid} reconciliation: ${result.type}`
            );

        } catch (error) {
            console.error(
                `Payment reconciliation failed for ${order.paymentTxnId}:`,
                error.message
            );
        }
        const abandonedOrders = await findAbandonedOrders();

        for (const order of abandonedOrders) {
            try {
                const cancelled = await cancelAbandonedOrder(order._id);

                if (cancelled) {
                    console.log(`Abandoned order cancelled: ${order._id}`);
                }
            } catch (error) {
                console.error(
                    `Failed to cancel abandoned order ${order._id}:`,
                    error.message
                );
            }
        }
    }
};