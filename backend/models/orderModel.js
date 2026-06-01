import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,
        quantity: Number,
        image: String,
        price: Number,
        productId: String,
      },
    ],

    shippingAddress: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Order",
  orderSchema
);