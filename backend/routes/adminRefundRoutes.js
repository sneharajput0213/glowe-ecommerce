import express from "express";
import {
    initiateRefund,
    checkRefundStatus
} from "../controllers/adminRefundController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import { refundOrderParamsSchema, initiateRefundSchema } from "../validators/refundValidators.js";

const router = express.Router();

router.post(
    "/:orderId",
    authMiddleware,
    authorize("admin"),
    validateParams(refundOrderParamsSchema),
    validate(initiateRefundSchema),
    initiateRefund
);

router.get(
    "/:orderId/payments/:txnid/refund-status",
    authMiddleware,
    authorize("admin"),
    validateParams(refundOrderParamsSchema),
    checkRefundStatus
);

export default router;