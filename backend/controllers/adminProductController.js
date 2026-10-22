import Product from "../models/productModel.js";

export const getAllProductsForAdmin = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            products,
            totalProducts: products.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.validatedParams;
        const { isActive } = req.validatedBody;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.isActive = isActive;

        await product.save();

        return res.status(200).json({
            message: isActive
                ? "Product activated successfully"
                : "Product deactivated successfully",
            product: {
                _id: product._id,
                name: product.name,
                isActive: product.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};