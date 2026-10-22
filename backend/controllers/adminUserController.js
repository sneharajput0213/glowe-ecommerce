import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: "customer"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            users,
            totalUsers: users.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.validatedParams;
        const { isActive } = req.validatedBody;

        const user = await User.findOne({
            _id: userId,
            role: "customer"
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isActive = isActive;

        await user.save();

        return res.status(200).json({
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({
            role: "seller"
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            sellers,
            totalSellers: sellers.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const updateSellerStatus = async (req, res) => {
    try {
        const { sellerId } = req.validatedParams;
        const { isActive } = req.validatedBody;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean"
            });
        }

        const seller = await User.findOne({
            _id: sellerId,
            role: "seller"
        });

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        seller.isActive = isActive;

        await seller.save();

        return res.status(200).json({
            message: isActive
                ? "Seller activated successfully"
                : "Seller deactivated successfully",
            seller: {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                role: seller.role,
                isActive: seller.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};