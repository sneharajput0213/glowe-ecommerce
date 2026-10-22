import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res) => {
    const { product, quantity } = req.validatedBody;

    if (!product || quantity === undefined) {
        return res.status(400).json({
            message: "Please provide product and quantity"
        });
    }

    if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        return res.status(400).json({
            message: "Quantity must be a positive whole number"
        });
    }

    if (!product.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    try{
        const existingProduct = await Product.findById(product);

        if (!existingProduct || !existingProduct.isActive) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (existingProduct.countInStock < quantity) {
            return res.status(400).json({
                message: "Not enough stock available"
            });
        }

        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const newCart = await Cart.create({
                user: userId,
                items: [
                    {
                        product,
                        quantity
                    }
                ]
            });

            return res.status(201).json({
                message: "Product added to cart",
                cart: newCart
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === product
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > existingProduct.countInStock) {
                return res.status(400).json({
                    message: "Not enough stock available"
                });
            }
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product,
                quantity
            });
        }

        await cart.save();

        return res.status(200).json({
            message: "Product added to cart",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getCart = async (req, res) => {
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        // Create an empty cart for a user who doesn't have one yet
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        return res.status(200).json({ cart });

    } catch (error) {
        console.error("Error fetching cart:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateCartItem = async (req, res) => {

    const { productId } = req.validatedParams;
    const { quantity } = req.validatedBody;

    const userId = req.user.id;

    try {

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > existingProduct.countInStock) {
            return res.status(400).json({
                message: "Not enough stock available"
            });
        }

        existingItem.quantity = quantity;

        await cart.save();

        return res.status(200).json({
            message: "Cart updated successfully",
            cart
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }
};

export const removeFromCart = async (req, res) => {
    const { productId } = req.validatedParams;
    const userId = req.user.id;

    try {

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found"
        });
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );
    await cart.save();

    return res.status(200).json({
        message: "Product removed from cart",
        cart
    });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const clearCart = async (req, res) => {
    const userId = req.user.id;

    try {

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};