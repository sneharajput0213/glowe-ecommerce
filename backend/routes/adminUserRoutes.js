import express from "express";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import {
    adminUserParamsSchema,
    adminSellerParamsSchema,
    updateAccountStatusSchema
} from "../validators/adminUserValidators.js";
import {
    getAllUsers,
    updateUserStatus,
    getAllSellers,
    updateSellerStatus
} from "../controllers/adminUserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/users",
    authMiddleware,
    authorize("admin"),
    getAllUsers
);

router.put(
    "/users/:userId/status",
    authMiddleware,
    authorize("admin"),
    validateParams(adminUserParamsSchema),
    validate(updateAccountStatusSchema),
    updateUserStatus
);

router.get(
    "/sellers",
    authMiddleware,
    authorize("admin"),
    getAllSellers
);

router.put(
    "/sellers/:sellerId/status",
    authMiddleware,
    authorize("admin"),
    validateParams(adminSellerParamsSchema),
    validate(updateAccountStatusSchema),
    updateSellerStatus
);

export default router;