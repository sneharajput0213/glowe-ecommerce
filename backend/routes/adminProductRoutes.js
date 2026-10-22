import express from "express";
import {
    getAllProductsForAdmin,
    updateProductStatus
} from "../controllers/adminProductController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import { updateAccountStatusSchema, adminProductParamsSchema } from "../validators/adminUserValidators.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    getAllProductsForAdmin
);

router.put(
    "/:productId/status",
    authMiddleware,
    authorize("admin"),
    validateParams(adminProductParamsSchema),
    validate(updateAccountStatusSchema),
    updateProductStatus
);

export default router;