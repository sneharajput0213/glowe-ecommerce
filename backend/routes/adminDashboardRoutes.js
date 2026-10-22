import express from "express";

import {
    getAdminDashboardOverview,
    getAdminUsers,
    getAdminSellers,
    getAdminProducts,
    getAdminOrders,
    getAdminSalesAnalytics,
    getAdminSellerPerformance,
    updateSellerApproval
} from "../controllers/adminDashboardController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    getAdminDashboardOverview
);

router.get(
    "/users",
    authMiddleware,
    authorize("admin"),
    getAdminUsers
);

router.get(
    "/sellers",
    authMiddleware,
    authorize("admin"),
    getAdminSellers
);

router.get(
    "/products",
    authMiddleware,
    authorize("admin"),
    getAdminProducts
);

router.get(
    "/orders",
    authMiddleware,
    authorize("admin"),
    getAdminOrders
);

router.get(
    "/analytics",
    authMiddleware,
    authorize("admin"),
    getAdminSalesAnalytics
);

router.get(
    "/seller-performance",
    authMiddleware,
    authorize("admin"),
    getAdminSellerPerformance
);

router.patch(
    "/sellers/:id/approval",
    authMiddleware,
    authorize("admin"),
    updateSellerApproval
);

export default router;