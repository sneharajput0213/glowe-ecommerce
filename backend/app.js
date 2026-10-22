
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import sellerDashboardRoutes from "./routes/sellerDashboardRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminRefundRoutes from "./routes/adminRefundRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter.js";
import {
    notFoundHandler,
    errorHandler
} from "./middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use("/api", (req, res, next) => {
    const isPayUCallback =
        req.method === "POST" &&
        (
            req.path === "/payments/success" ||
            req.path === "/payments/failure"
        );

    if (isPayUCallback) {
        return next();
    }

    return apiLimiter(req, res, next);
});

app.use(express.json({
    limit: "10kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10kb"
}));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/seller/dashboard", sellerDashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/refunds", adminRefundRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/", (req, res) => {
    res.send("Glowe backend is running");
});

// Handle unknown API endpoints
app.use("/api", notFoundHandler);

// Handle errors from middleware and routes
app.use(errorHandler);

export default app;
