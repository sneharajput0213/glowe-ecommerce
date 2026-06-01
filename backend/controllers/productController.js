import Product from "../models/productModel.js";

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(
      req.body
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name =
      req.body.name || product.name;

    product.image =
      req.body.image || product.image;

    product.brand =
      req.body.brand || product.brand;

    product.category =
      req.body.category || product.category;

    product.description =
      req.body.description ||
      product.description;

    product.price =
      req.body.price || product.price;

    product.countInStock =
      req.body.countInStock ||
      product.countInStock;

    const updatedProduct =
      await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};