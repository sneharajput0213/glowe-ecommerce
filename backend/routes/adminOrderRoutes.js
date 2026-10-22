import express from "express";
import {
    getAllOrdersForAdmin,
    getAdminOrderById,
    updateAdminOrderStatus
} from "../controllers/adminOrderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import { orderIdParamsSchema, updateAdminOrderStatusSchema } from "../validators/orderValidators.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    getAllOrdersForAdmin
);

router.get(
    "/:orderId",
    authMiddleware,
    authorize("admin"),
    validateParams(orderIdParamsSchema),
    getAdminOrderById
);

router.put(
    "/:orderId/status",
    authMiddleware,
    authorize("admin"),
    validateParams(orderIdParamsSchema),
    validate(updateAdminOrderStatusSchema),
    updateAdminOrderStatus
);

export default router;