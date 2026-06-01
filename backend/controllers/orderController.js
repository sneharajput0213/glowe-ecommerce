import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/User.js";
export const createOrder = async (
  req,
  res
) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    const order = await Order.create({
      user: req.user._id,

      orderItems,

      shippingAddress,

      paymentMethod,

      totalPrice,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res
          .status(404)
          .json({
            message:
              "Order not found",
          });
      }

      order.status =
        req.body.status;

      const updatedOrder =
        await order.save();

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

  export const getDashboardStats = async (
  req,
  res
) => {
  try {
    const users = await User.countDocuments();

    const products =
      await Product.countDocuments();

    const orders =
      await Order.countDocuments();

    const ordersData =
      await Order.find();

    const revenue =
      ordersData.reduce(
        (acc, order) =>
          acc + order.totalPrice,
        0
      );

    res.json({
      users,
      products,
      orders,
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};