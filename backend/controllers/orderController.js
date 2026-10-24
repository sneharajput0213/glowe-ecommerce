import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import { restoreOrderStock } from "../services/inventoryService.js";
import mongoose from "mongoose";
import { getCancellationRefundDetails, initiateOrderRefund } from "../services/refundService.js";

export const createOrder = async (req, res) => {
    const { shippingAddress } = req.validatedBody;
    const userId = req.user.id;
    const session = await mongoose.startSession();

    try {
        let createdOrder = null;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({
                user: userId
            }).session(session);

            if (!cart) {
                const error = new Error("Cart not found");
                error.statusCode = 404;
                throw error;
            }

            if (cart.items.length === 0) {
                const error = new Error("Cart is empty");
                error.statusCode = 400;
                throw error;
            }

            const orderItems = [];
            let totalPrice = 0;

            for (const item of cart.items) {
                const product = await Product.findById(
                    item.product
                ).session(session);

                if (!product || !product.isActive) {
                    const error = new Error("Product not found or inactive");
                    error.statusCode = 400;
                    throw error;
                } 

                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        isActive: true,
                        countInStock: { $gte: item.quantity }
                    },
                    {
                        $inc: { countInStock: -item.quantity }
                    },
                    {
                        returnDocument: "after",
                        session
                    }
                );

                if (!updatedProduct) {
                    const error = new Error(
                        `Not enough stock available for ${product.name}`
                    );
                    error.statusCode = 400;
                    throw error;
                }

                orderItems.push({
                    product: product._id,
                    seller: product.seller,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    fulfillmentStatus: "pending"
                });

                totalPrice += product.price * item.quantity;
            }

            const shipping = totalPrice > 0 && totalPrice < 799
                ? 79
                : 0;

            totalPrice += shipping;

            const order = new Order({
                user: userId,
                items: orderItems,
                totalPrice,
                shippingAddress
            });

            await order.save({ session });

            cart.items = [];

            await cart.save({ session });

            createdOrder = order;
        });

        return res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Create order error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid order details",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                )
            });
        }

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    } finally {
        await session.endSession();
    }
};

export const getMyOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders = await Order.find({
            user: userId,
            paymentStatus: "paid"
        })
            .populate("items.product")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getOrderById = async (req, res) => {

    const { orderId } = req.validatedParams;
    const userId = req.user.id;

    try {

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        }).populate("items.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            order
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const cancelOrder = async (req, res) => {
    const { orderId } = req.validatedParams;
    const userId = req.user.id;

    const session = await mongoose.startSession();

    try {
        let cancelledOrder = null;
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

            if (order.orderStatus === "cancelled") {
                rejection = {
                    status: 400,
                    message: "Order is already cancelled"
                };
                return;
            }

            if (
                order.items.some(item =>
                    ["shipped", "delivered"].includes(
                        item.fulfillmentStatus
                    )
                )
            ) {
                rejection = {
                    status: 400,
                    message: "Order cannot be cancelled after shipping"
                };
                return;
            }

            if (order.paymentStatus === "paid") {
                rejection = {
                    status: 400,
                    message: "Paid orders require a refund workflow"
                };
                return;
            }

            if (order.paymentTxnId) {
                rejection = {
                    status: 400,
                    message: "Payment is being processed"
                };
                return;
            }

            // Atomically claim cancellation while the
            // order still satisfies the eligibility rules.
            const claimedOrder = await Order.findOneAndUpdate(
                {
                    _id: orderId,
                    user: userId,
                    orderStatus: { $ne: "cancelled" },
                    paymentStatus: { $ne: "paid" },
                    paymentTxnId: null,
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
                    $set: {
                        orderStatus: "cancelled"
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!claimedOrder) {
                rejection = {
                    status: 409,
                    message:
                        "Order state changed. Please try again."
                };
                return;
            }

            // Restore inventory only if still reserved.
            const restored = await restoreOrderStock(
                orderId,
                session
            );

            if (
                !restored &&
                claimedOrder.inventoryStatus !== "restored"
            ) {
                throw new Error(
                    "Unable to restore order inventory"
                );
            }

            cancelledOrder = await Order.findById(
                orderId
            ).session(session);
        });

        if (rejection) {
            return res.status(rejection.status).json({
                message: rejection.message
            });
        }

        return res.status(200).json({
            message: "Order cancelled successfully",
            order: cancelledOrder
        });

    } catch (error) {
        console.error("Order cancellation error:", error.message);

        return res.status(500).json({
            message: "Unable to cancel order"
        });
    } finally {
        await session.endSession();
    }
};

export const requestPaidOrderCancellation = async (req, res) => {
    const { orderId } = req.validatedParams;
    const userId = req.user.id;

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                user: userId,
                paymentStatus: "paid",
                orderStatus: {
                    $in: ["confirmed", "processing"]
                },
                refundStatus: "none",
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
                $set: {
                    orderStatus: "cancellation_requested",
                    cancellationRequestedAt: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(409).json({
                message:
                    "Order is not eligible for cancellation or cancellation has already been requested."
            });
        }

        const refundDetails =
            await getCancellationRefundDetails(order._id);

        const result = await initiateOrderRefund({
            orderId: refundDetails.orderId,
            txnid: refundDetails.txnid,
            amount: refundDetails.amount,
            mode: "customer_cancellation"
        });

        return res.status(result.status).json({
            message: result.message,
            orderId: order._id,
            orderStatus: "cancellation_requested",
            refundStatus: result.refundStatus ?? "none",
            ...(result.refundRequestId && {
                refundRequestId: result.refundRequestId
            })
        });

    } catch (error) {
        console.error(
            "Customer cancellation error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Cancellation requires attention. Please contact support if the request remains pending."
        });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            "items.seller": req.user.id,
            paymentStatus: "paid"
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        const sellerOrders = orders.map(order => {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === req.user.id
            );

            const sellerSubtotal = sellerItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );

            return {
                _id: order._id,
                user: order.user,
                items: sellerItems,
                shippingAddress: order.shippingAddress,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                sellerSubtotal,
                createdAt: order.createdAt
            };
        });

        return res.status(200).json({
            orders: sellerOrders,
            totalOrders: sellerOrders.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateSellerOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId } = req.validatedParams;
        const { fulfillmentStatus } = req.validatedBody;

        const allowedTransitions = {
            pending: "processing",
            processing: "shipped",
            shipped: "delivered"
        };

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const item = order.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Order item not found"
            });
        }

        if (item.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You cannot update this item"
            });
        }

        if (["cancelled", "cancellation_requested"].includes(order.orderStatus)) {
            return res.status(400).json({
                message: "Cannot process a cancelled order or an order awaiting cancellation"
            });
        }

        if (order.paymentStatus !== "paid") {
            return res.status(400).json({
                message: "Order payment is not completed"
            });
        }

        if (allowedTransitions[item.fulfillmentStatus] !== fulfillmentStatus) {
            return res.status(400).json({
                message: "Invalid status transition"
            });
        }

       const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                paymentStatus: "paid",
                orderStatus: {
                    $nin: ["cancelled", "cancellation_requested"]
                },
                items: {
                    $elemMatch: {
                        _id: itemId,
                        seller: req.user.id,
                        fulfillmentStatus: item.fulfillmentStatus
                    }
                }
            },
            [
                {
                    $set: {
                        items: {
                            $map: {
                                input: "$items",
                                as: "orderItem",
                                in: {
                                    $cond: [
                                        { $eq: ["$$orderItem._id", item._id] },
                                        {
                                            $mergeObjects: [
                                                "$$orderItem",
                                                { fulfillmentStatus }
                                            ]
                                        },
                                        "$$orderItem"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        orderStatus: {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $allElementsTrue: {
                                                $map: {
                                                    input: "$items",
                                                    as: "i",
                                                    in: {
                                                        $eq: [
                                                            "$$i.fulfillmentStatus",
                                                            "delivered"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        then: "delivered"
                                    },
                                    {
                                        case: {
                                            $allElementsTrue: {
                                                $map: {
                                                    input: "$items",
                                                    as: "i",
                                                    in: {
                                                        $in: [
                                                            "$$i.fulfillmentStatus",
                                                            ["shipped", "delivered"]
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        then: "shipped"
                                    },
                                    {
                                        case: {
                                            $anyElementTrue: {
                                                $map: {
                                                    input: "$items",
                                                    as: "i",
                                                    in: {
                                                        $in: [
                                                            "$$i.fulfillmentStatus",
                                                            ["processing", "shipped", "delivered"]
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        then: "processing"
                                    }
                                ],
                                default: "confirmed"
                            }
                        }
                    }
                }
            ],
            {
                new: true
            }
        );

        if (!updatedOrder) {
            return res.status(409).json({
                message: "Order status changed. Please refresh and try again."
            });
        }

        return res.status(200).json({
            message: "Fulfillment status updated successfully",
            item: updatedOrder.items.id(itemId)
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};