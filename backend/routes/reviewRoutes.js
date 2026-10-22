import express from "express";
import { createReview, getProductReviews, updateReview, deleteReview } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import {
    createReviewSchema,
    updateReviewSchema,
    productReviewParamsSchema,
    reviewIdParamsSchema
} from "../validators/reviewValidators.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("customer"),
    validate(createReviewSchema),
    createReview
);

router.get(
    "/product/:productId",
    validateParams(productReviewParamsSchema),
    getProductReviews
);

router.put(
    "/:reviewId",
    authMiddleware,
    validateParams(reviewIdParamsSchema),
    validate(updateReviewSchema),
    updateReview
);

router.delete(
    "/:reviewId",
    authMiddleware,
    validateParams(reviewIdParamsSchema),
    deleteReview
);

export default router;