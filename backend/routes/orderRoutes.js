import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder, getSellerOrders, updateSellerOrderItemStatus } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, orderIdParamsSchema, orderItemParamsSchema, updateSellerOrderItemStatusSchema } from "../validators/orderValidators.js";
import { validateParams } from "../middleware/validateParams.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createOrderSchema), createOrder);
router.get("/", authMiddleware, getMyOrders);
router.put("/:orderId/cancel", authMiddleware, validateParams(orderIdParamsSchema), cancelOrder);
router.get("/seller", authMiddleware, authorize("seller"), getSellerOrders);
router.put("/:orderId/items/:itemId/status", authMiddleware, authorize("seller"), validateParams(orderItemParamsSchema), validate(updateSellerOrderItemStatusSchema), updateSellerOrderItemStatus);
router.get("/:orderId", authMiddleware, validateParams(orderIdParamsSchema), getOrderById);

export default router;