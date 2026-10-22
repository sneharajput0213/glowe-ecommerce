import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addToCartSchema,
  updateCartItemSchema
} from "../validators/cartValidators.js";
import { validateParams } from "../middleware/validateParams.js";
import { cartProductParamsSchema } from "../validators/cartValidators.js";

const router = express.Router();

router.post("/", authMiddleware, validate(addToCartSchema), addToCart);
router.get("/", authMiddleware, getCart);
router.put(
  "/:productId",
  authMiddleware,
  validateParams(cartProductParamsSchema),
  validate(updateCartItemSchema),
  updateCartItem
);

router.delete(
  "/:productId",
  authMiddleware,
  validateParams(cartProductParamsSchema),
  removeFromCart
);
router.delete("/", authMiddleware, clearCart);

export default router;