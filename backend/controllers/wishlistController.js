import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";

export const addToWishlist = async (req, res) => {
    const { product } = req.validatedBody;

    try{
        const existingProduct = await Product.findById(product);

        if (!existingProduct || !existingProduct.isActive) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            const newWishlist = await Wishlist.create({
                user: userId,
                products: [product]
            });

            return res.status(201).json({
                message: "Product added to wishlist",
                wishlist: newWishlist
            });
        }

        const productExists = wishlist.products.some(
            (item) => item.toString() === product
        );

        if (productExists) {
            return res.status(400).json({
                message: "Product already exists in wishlist"
            });
        }

        wishlist.products.push(product);
        await wishlist.save();

        return res.status(200).json({
            message: "Product added to wishlist",
            wishlist
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getWishlist = async (req, res) => {
    const userId = req.user.id;

    try {
        let wishlist = await Wishlist.findOne({ user: userId })
            .populate("products");

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: []
            });
        }

        return res.status(200).json({
            wishlist
        });

    } catch (error) {
        console.error("Error fetching wishlist:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {

    const { productId } = req.validatedParams;
    const userId = req.user.id;

    try {

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found"
            });
        }

        const productExists = wishlist.products.some(
            (item) => item.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({
                message: "Product not found in wishlist"
            });
        }

        wishlist.products = wishlist.products.filter(
            (item) => item.toString() !== productId
        );

        await wishlist.save();

        return res.status(200).json({
            message: "Product removed from wishlist",
            wishlist
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }
};

export const clearWishlist = async (req, res) => {

    const userId = req.user.id;

    try {

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found"
            });
        }

        wishlist.products = [];

        await wishlist.save();

        return res.status(200).json({
            message: "Wishlist cleared successfully",
            wishlist
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });

    }
};