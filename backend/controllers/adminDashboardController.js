import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

export const getAdminDashboardOverview = async (req, res) => {
    try {
        const [
            totalUsers,
            totalSellers,
            totalProducts,
            totalOrders
        ] = await Promise.all([
            User.countDocuments({ role: "customer" }),
            User.countDocuments({ role: "seller" }),
            Product.countDocuments(),
            Order.countDocuments({
                paymentStatus: "paid"
            })
        ]);

        const revenueResult = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    refundStatus: {
                        $nin: ["pending", "refunded"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]);

        const pendingOrders = await Order.countDocuments({
            paymentStatus: "paid",
            orderStatus: {
                $nin: ["delivered", "cancelled"]
            }
        });

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        return res.status(200).json({
            overview: {
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: "customer"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            users,
            totalUsers: users.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminSellers = async (req, res) => {
    try {
        const sellers = await User.find({
            role: "seller"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            sellers,
            totalSellers: sellers.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            products,
            totalProducts: products.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            paymentStatus: "paid"
        })
            .populate("user", "name email")
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


export const getAdminSalesAnalytics = async (req, res) => {
    try {
        const orders = await Order.find({
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            }
        }).sort({ createdAt: 1 });

        const dailyMap = new Map();
        const monthlyMap = new Map();

        let totalRevenue = 0;
        let totalUnitsSold = 0;
        let totalOrders = 0;

        for (const order of orders) {
            totalOrders++;
            totalRevenue += order.totalPrice;

            for (const item of order.items) {
                totalUnitsSold += item.quantity;
            }

            const date = new Date(order.createdAt);

            const dailyKey = date.toISOString().slice(0, 10);

            const monthlyKey =
                `${date.getUTCFullYear()}-${String(
                    date.getUTCMonth() + 1
                ).padStart(2, "0")}`;

            if (!dailyMap.has(dailyKey)) {
                dailyMap.set(dailyKey, {
                    date: dailyKey,
                    revenue: 0,
                    unitsSold: 0,
                    orders: 0
                });
            }

            const daily = dailyMap.get(dailyKey);

            daily.revenue += order.totalPrice;
            daily.orders++;

            for (const item of order.items) {
                daily.unitsSold += item.quantity;
            }

            if (!monthlyMap.has(monthlyKey)) {
                monthlyMap.set(monthlyKey, {
                    month: monthlyKey,
                    revenue: 0,
                    unitsSold: 0,
                    orders: 0
                });
            }

            const monthly = monthlyMap.get(monthlyKey);

            monthly.revenue += order.totalPrice;
            monthly.orders++;

            for (const item of order.items) {
                monthly.unitsSold += item.quantity;
            }
        }

        return res.status(200).json({
            analytics: {
                daily: Array.from(dailyMap.values()),
                monthly: Array.from(monthlyMap.values()),
                totalRevenue,
                totalUnitsSold,
                totalOrders
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAdminSellerPerformance = async (req, res) => {
    try {
        const sellers = await User.find({
            role: "seller"
        }).select("name email");

        const orders = await Order.find({
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            },
            orderStatus: {
                $ne: "cancelled"
            }
        }).select("items");

        const productCounts = await Product.aggregate([
            {
                $group: {
                    _id: "$seller",
                    totalProducts: { $sum: 1 }
                }
            }
        ]);

        const performanceMap = new Map();

        // Initialize all sellers, including those with no sales.
        for (const seller of sellers) {
            performanceMap.set(String(seller._id), {
                sellerId: seller._id,
                name: seller.name,
                email: seller.email,
                totalRevenue: 0,
                totalOrders: 0,
                unitsSold: 0,
                totalProducts: 0
            });
        }

        // Count products belonging to each seller.
        for (const product of productCounts) {
            const sellerId = String(product._id);
            const performance = performanceMap.get(sellerId);

            if (performance) {
                performance.totalProducts = product.totalProducts;
            }
        }

        // Calculate sales from individual order items.
        for (const order of orders) {
            const sellersInOrder = new Set();

            for (const item of order.items) {
                if (item.fulfillmentStatus === "cancelled") {
                    continue;
                }

                const sellerId = String(item.seller);
                const performance = performanceMap.get(sellerId);

                if (!performance) {
                    continue;
                }

                performance.totalRevenue +=
                    item.price * item.quantity;

                performance.unitsSold += item.quantity;

                sellersInOrder.add(sellerId);
            }

            // Count each order only once per seller.
            for (const sellerId of sellersInOrder) {
                performanceMap.get(sellerId).totalOrders++;
            }
        }

        const performance = Array.from(
            performanceMap.values()
        ).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return res.status(200).json({
            performance,
            totalSellers: performance.length
        });

    } catch (error) {
        console.error("Seller performance error:", error);

        return res.status(500).json({
            message: "Failed to fetch seller performance"
        });
    }
};


export const updateSellerApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { sellerStatus } = req.body;

        // Validate seller ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid seller ID"
            });
        }

        // Validate approval status
        if (!["approved", "rejected"].includes(sellerStatus)) {
            return res.status(400).json({
                message: "Invalid seller approval status"
            });
        }

        // Find seller account
        const seller = await User.findOne({
            _id: id,
            role: "seller"
        });

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        // Only pending applications can be reviewed
        if (seller.sellerStatus !== "pending") {
            return res.status(409).json({
                message: "Only pending seller applications can be reviewed"
            });
        }

        // Update approval status
        const updatedSeller = await User.findOneAndUpdate(
            {
                _id: id,
                role: "seller",
                sellerStatus: "pending"
            },
            {
                $set: { sellerStatus }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if (!updatedSeller) {
            return res.status(409).json({
                message: "Seller application has already been reviewed"
            });
        }

        return res.status(200).json({
            message:
                sellerStatus === "approved"
                    ? "Seller approved successfully"
                    : "Seller application rejected",
            seller: updatedSeller
        });

    } catch (error) {
        console.error("Seller approval error:", error);

        return res.status(500).json({
            message: "Unable to update seller approval"
        });
    }
};
