
import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // Main product image (backward compatibility)
    image: {
      type: String,
      required: true,
    },

    // Cloudinary product image gallery
    images: {
      type: [productImageSchema],
      default: [],
    },

    brand: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
