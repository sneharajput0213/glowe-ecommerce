import express from "express";
import { createPayment, handlePayUResponse, reconcilePayment, getFailedPayments } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createPaymentSchema } from "../validators/paymentValidators.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createPaymentSchema), createPayment);
router.post("/success", handlePayUResponse);
router.post("/failure", handlePayUResponse);
router.get("/failed", authMiddleware, getFailedPayments);
router.post("/:orderId/reconcile", authMiddleware, reconcilePayment);

export default router;