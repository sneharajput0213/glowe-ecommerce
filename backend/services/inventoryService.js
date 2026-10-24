import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const restoreOrderStock = async (orderId, session) => {
    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            inventoryStatus: "reserved"
        },
        {
            $set: { inventoryStatus: "restored" }
        },
        {
            returnDocument: "after",
            session
        }
    );

    if (!order) {
        return false;
    }

    for (const item of order.items) {
        const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { countInStock: item.quantity } },
            { session }
        );

        if (result.matchedCount !== 1) {
            throw new Error("Product not found while restoring stock");
        }
    }

    return true;
};

export const reserveOrderStock = async (orderId, session) => {
    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            inventoryStatus: "restored",
            paymentStatus: "failed",
            orderStatus: {
                $nin: ["cancelled", "cancellation_requested"]
            }
        },
        {
            $set: { inventoryStatus: "reserved" }
        },
        {
            returnDocument: "after",
            session
        }
    );

    if (!order) {
        return false;
    }

    for (const item of order.items) {
        const result = await Product.updateOne(
            {
                _id: item.product,
                countInStock: { $gte: item.quantity }
            },
            {
                $inc: { countInStock: -item.quantity }
            },
            { session }
        );

        if (result.matchedCount !== 1) {
            throw new Error(`Insufficient stock for ${item.name}`);
        }
    }

    return true;
};