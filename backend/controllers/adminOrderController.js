import Order from "../models/orderModel.js";

export const getAllOrdersForAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.product", "name")
            .populate("items.seller", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            orders,
            totalOrders: orders.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminOrderById = async (req, res) => {
    try {
        const { orderId } = req.validatedParams;

        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product", "name")
            .populate("items.seller", "name email");

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


export const updateAdminOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.validatedParams;
        const { orderStatus } = req.validatedBody;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (orderStatus === "confirmed" && order.paymentStatus !== "paid") {
            return res.status(400).json({
                message: "Order cannot be confirmed until payment is completed"
            });
        }

        if (orderStatus === "cancelled") {
            return res.status(400).json({
                message: "Admin cancellation requires a dedicated cancellation workflow"
            });
        }

        const allowedTransitions = {
            pending: ["confirmed"],
            confirmed: ["processing"],
            processing: ["shipped"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: []
        };

        if (["processing", "shipped", "delivered"].includes(orderStatus)) {
            return res.status(400).json({
                message: "Fulfillment status is managed through individual order items"
            });
        }

        if (!allowedTransitions[order.orderStatus]?.includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status transition"
            });
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                message: "Delivered order cannot be changed"
            });
        }

        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                message: "Cancelled order cannot be changed"
            });
        }

        order.orderStatus = orderStatus;

        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            order: {
                _id: order._id,
                orderStatus: order.orderStatus
            }
        });

    } catch (error) {
        console.error("Admin order status update error:", error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};