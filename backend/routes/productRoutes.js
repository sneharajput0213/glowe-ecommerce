import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getMyInventory,
  updateMyInventory,
  getBestSellers,
} from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema, updateInventorySchema } from "../validators/productValidators.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { z } from "zod";
import { validateParams } from "../middleware/validateParams.js";

const router = express.Router();

// Create product
router.post(
  "/",
  authMiddleware,
  authorize("seller", "admin"),
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct
);

// Get products
router.get("/", getProducts);

router.get("/best-sellers", getBestSellers);

// Update product
router.put(
  "/:id",
  authMiddleware,
  authorize("seller", "admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  authorize("seller", "admin"),
  deleteProduct
);

// Seller products
router.get(
  "/my-products",
  authMiddleware,
  authorize("seller"),
  getMyProducts
);

// Seller inventory
router.get(
  "/my-inventory",
  authMiddleware,
  authorize("seller"),
  getMyInventory
);

// Get product by ID
router.get("/:id", getProductById);

// Update inventory
router.put(
    "/my-inventory/:productId",
    authMiddleware,
    authorize("seller"),
    validateParams(
        z.object({
            productId: z.string().regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid product ID"
            )
        }).strict()
    ),
    validate(updateInventorySchema),
    updateMyInventory
);

export default router;