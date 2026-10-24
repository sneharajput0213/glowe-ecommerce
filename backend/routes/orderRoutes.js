import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder, requestPaidOrderCancellation, getSellerOrders, updateSellerOrderItemStatus } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, orderIdParamsSchema, orderItemParamsSchema, updateSellerOrderItemStatusSchema } from "../validators/orderValidators.js";
import { validateParams } from "../middleware/validateParams.js";
import Order from "../models/orderModel.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createOrderSchema), createOrder);
router.get("/", authMiddleware, getMyOrders);
router.put(
    "/:orderId/cancel",
    authMiddleware,
    authorize("customer"),
    validateParams(orderIdParamsSchema),
    async (req, res, next) => {
        try {
            const order = await Order.findOne({
                _id: req.validatedParams.orderId,
                user: req.user.id
            }).select("paymentStatus");

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            if (order.paymentStatus === "paid") {
                return requestPaidOrderCancellation(req, res);
            }

            return cancelOrder(req, res);
        } catch (error) {
            next(error);
        }
    }
);
router.get("/seller", authMiddleware, authorize("seller"), getSellerOrders);
router.put("/:orderId/items/:itemId/status", authMiddleware, authorize("seller"), validateParams(orderItemParamsSchema), validate(updateSellerOrderItemStatusSchema), updateSellerOrderItemStatus);
router.get("/:orderId", authMiddleware, validateParams(orderIdParamsSchema), getOrderById);

export default router;