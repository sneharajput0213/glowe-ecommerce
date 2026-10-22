import express from "express";

import {
    getSellerDashboardOverview,
    getSellerSalesAnalytics,
    getSellerProductPerformance,
    getSellerBestSellingProducts,
    getSellerLeastSellingProducts
} from "../controllers/sellerDashboardController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorize("seller"),
    getSellerDashboardOverview
);

router.get(
    "/analytics",
    authMiddleware,
    authorize("seller"),
    getSellerSalesAnalytics
);

router.get(
    "/performance",
    authMiddleware,
    authorize("seller"),
    getSellerProductPerformance
);

router.get(
    "/best-selling",
    authMiddleware,
    authorize("seller"),
    getSellerBestSellingProducts
);

router.get(
    "/least-selling",
    authMiddleware,
    authorize("seller"),
    getSellerLeastSellingProducts
);

export default router;