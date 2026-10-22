import express from "express";
import {
  register,
  registerSeller,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  registerSchema,
  sellerRegisterSchema,
  loginSchema,
  updateProfileSchema
} from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/register-seller",
  authLimiter,
  validate(sellerRegisterSchema),
  registerSeller
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  login
);

router.get("/profile", authMiddleware, getProfile);

router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile
);

export default router;
