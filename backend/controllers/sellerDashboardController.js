import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const getSellerDashboardOverview = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const products = await Product.find({
            seller: sellerId
        }).select("countInStock");

        const orders = await Order.find({
            "items.seller": sellerId
        });

        let totalOrders = 0;
        let totalUnitsSold = 0;
        let totalRevenue = 0;
        let pendingOrders = 0;

        for (const order of orders) {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === sellerId
            );

            if (sellerItems.length === 0) {
                continue;
            }

            totalOrders++;

            if (
                order.paymentStatus === "paid" &&
                order.refundStatus !== "pending" &&
                order.refundStatus !== "refunded"
            ) {
                for (const item of sellerItems) {
                    totalUnitsSold += item.quantity;
                    totalRevenue += item.price * item.quantity;
                }
            }

            const hasPendingSellerItems = sellerItems.some(
                item =>
                    item.fulfillmentStatus === "pending" ||
                    item.fulfillmentStatus === "processing" ||
                    item.fulfillmentStatus === "shipped"
            );

            if (
                order.paymentStatus === "paid" &&
                order.orderStatus !== "cancelled" &&
                hasPendingSellerItems
            ) {
                pendingOrders++;
            }
        }

        const lowStockProducts = products.filter(
            product => product.countInStock <= 5
        ).length;

        return res.status(200).json({
            overview: {
                totalProducts: products.length,
                totalOrders,
                totalUnitsSold,
                totalRevenue,
                pendingOrders,
                lowStockProducts
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getSellerSalesAnalytics = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const orders = await Order.find({
            "items.seller": sellerId,
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            }
        }).sort({ createdAt: 1 });

        const dailyMap = new Map();
        const weeklyMap = new Map();
        const monthlyMap = new Map();

        let totalRevenue = 0;
        let totalUnitsSold = 0;
        let totalOrders = 0;

        for (const order of orders) {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === sellerId
            );

            if (sellerItems.length === 0) {
                continue;
            }

            totalOrders++;

            let orderRevenue = 0;
            let orderUnits = 0;

            for (const item of sellerItems) {
                const revenue = item.price * item.quantity;

                totalRevenue += revenue;
                totalUnitsSold += item.quantity;

                orderRevenue += revenue;
                orderUnits += item.quantity;
            }

            const date = new Date(order.createdAt);

            const dailyKey = date.toISOString().slice(0, 10);

            const weekStart = new Date(date);
            const day = weekStart.getUTCDay();

            weekStart.setUTCDate(
                weekStart.getUTCDate() - day
            );

            const weeklyKey = weekStart.toISOString().slice(0, 10);

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
            daily.revenue += orderRevenue;
            daily.unitsSold += orderUnits;
            daily.orders++;

            if (!weeklyMap.has(weeklyKey)) {
                weeklyMap.set(weeklyKey, {
                    weekStarting: weeklyKey,
                    revenue: 0,
                    unitsSold: 0,
                    orders: 0
                });
            }

            const weekly = weeklyMap.get(weeklyKey);
            weekly.revenue += orderRevenue;
            weekly.unitsSold += orderUnits;
            weekly.orders++;

            if (!monthlyMap.has(monthlyKey)) {
                monthlyMap.set(monthlyKey, {
                    month: monthlyKey,
                    revenue: 0,
                    unitsSold: 0,
                    orders: 0
                });
            }

            const monthly = monthlyMap.get(monthlyKey);
            monthly.revenue += orderRevenue;
            monthly.unitsSold += orderUnits;
            monthly.orders++;
        }

        return res.status(200).json({
            analytics: {
                daily: Array.from(dailyMap.values()),
                weekly: Array.from(weeklyMap.values()),
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


export const getSellerProductPerformance = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const orders = await Order.find({
            "items.seller": sellerId,
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            }
        });

        const performanceMap = new Map();

        for (const order of orders) {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === sellerId
            );

            for (const item of sellerItems) {
                const productId = item.product.toString();

                if (!performanceMap.has(productId)) {
                    performanceMap.set(productId, {
                        product: item.product,
                        name: item.name,
                        unitsSold: 0,
                        revenue: 0,
                        orders: 0
                    });
                }

                const product = performanceMap.get(productId);

                product.unitsSold += item.quantity;
                product.revenue += item.price * item.quantity;
                product.orders++;
            }
        }

        const products = Array.from(
            performanceMap.values()
        );

        products.sort(
            (a, b) => b.unitsSold - a.unitsSold
        );

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


export const getSellerBestSellingProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const orders = await Order.find({
            "items.seller": sellerId,
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            }
        });

        const productMap = new Map();

        for (const order of orders) {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === sellerId
            );

            for (const item of sellerItems) {
                const productId = item.product.toString();

                if (!productMap.has(productId)) {
                    productMap.set(productId, {
                        product: item.product,
                        name: item.name,
                        unitsSold: 0,
                        revenue: 0
                    });
                }

                const product = productMap.get(productId);

                product.unitsSold += item.quantity;
                product.revenue += item.price * item.quantity;
            }
        }

        const products = Array.from(
            productMap.values()
        );

        products.sort(
            (a, b) => b.unitsSold - a.unitsSold
        );

        return res.status(200).json({
            products: products.slice(0, 5)
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getSellerLeastSellingProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const products = await Product.find({
            seller: sellerId
        }).select("_id name");

        const orders = await Order.find({
            "items.seller": sellerId,
            paymentStatus: "paid",
            refundStatus: {
                $nin: ["pending", "refunded"]
            }
        });

        const salesMap = new Map();

        for (const order of orders) {
            const sellerItems = order.items.filter(
                item => item.seller.toString() === sellerId
            );

            for (const item of sellerItems) {
                const productId = item.product.toString();

                salesMap.set(
                    productId,
                    (salesMap.get(productId) || 0) + item.quantity
                );
            }
        }

        const leastSelling = products.map(product => ({
            product: product._id,
            name: product.name,
            unitsSold: salesMap.get(product._id.toString()) || 0
        }));

        leastSelling.sort(
            (a, b) => a.unitsSold - b.unitsSold
        );

        return res.status(200).json({
            products: leastSelling.slice(0, 5)
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};