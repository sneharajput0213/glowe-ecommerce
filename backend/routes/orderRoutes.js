import express from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get(
  "/myorders",
  protect,
  getMyOrders
);

router.get(
  "/allorders",
  protect,
  getAllOrders
);

router.get(
  "/dashboard-stats",
  protect,
  getDashboardStats
);

router.put(
  "/:id/status",
  protect,
  updateOrderStatus
);

export default router;