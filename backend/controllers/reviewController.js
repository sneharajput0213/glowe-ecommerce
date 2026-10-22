import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

export const createReview = async (req, res) => {
    const { product, rating, comment} = req.validatedBody;
    if (!product || rating === undefined || rating === null) {
        return res.status(400).json({
            message: "Please provide a product and rating"
        });
    }

    if (comment !== undefined && typeof comment !== "string") {
        return res.status(400).json({
            message: "Comment must be text"
        });
    }


    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be a number between 1 and 5"
        });
    }

    if (!product.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    try{
        const userId = req.user.id;
        const existingProduct = await Product.findById(product);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const existingReview = await Review.findOne({
            user: userId,
            product
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product"
            });
        }

        const createdReview = await Review.create({
            user: userId,
            product,
            rating,
            comment
        });

        return res.status(201).json({
            message: "Review created successfully",
            review: createdReview
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
}

export const getProductReviews = async (req, res) => {

    const { productId } = req.validatedParams;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    try {

        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const reviews = await Review.find({
            product: productId
        })
        .populate("user", "name")
        .sort({ createdAt: -1 });

        const ratingStats = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
        ]);

        const averageRating = ratingStats[0]?.averageRating || 0;
        const totalReviews = ratingStats[0]?.totalReviews || 0;

        return res.status(200).json({
            reviews,
            averageRating,
            totalReviews
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateReview = async (req, res) => {

    const { rating, comment } = req.validatedBody;

    const { reviewId } = req.validatedParams;

    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid review ID"
        });
    }

    if (rating === undefined || !comment) {
        return res.status(400).json({
            message: "Please provide rating and comment"
        });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be a number between 1 and 5"
        });
    }

    try {

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own review"
            });
        }

        review.rating = rating;
        if (comment !== undefined) {
           review.comment = comment;
        }

        await review.save();

        return res.status(200).json({
            message: "Review updated successfully",
            review
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const deleteReview = async (req, res) => {

    const { reviewId } = req.validatedParams;

    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid review ID"
        });
    }

    try {

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        if (
            review.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You can only delete your own review"
            });
        }

        await review.deleteOne();

        return res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};