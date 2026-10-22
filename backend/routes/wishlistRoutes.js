import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { validateParams } from "../middleware/validateParams.js";
import { addToWishlistSchema, wishlistProductParamsSchema } from "../validators/wishlistValidators.js";

const router = express.Router();

router.post("/", authMiddleware, validate(addToWishlistSchema), addToWishlist);
router.get("/", authMiddleware, getWishlist);
router.delete("/:productId", authMiddleware, validateParams(wishlistProductParamsSchema), removeFromWishlist);
router.delete("/", authMiddleware, clearWishlist);

export default router;