
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"]
        });

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Reject deactivated accounts
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated"
            });
        }

        // Reject sellers who are not approved
        if (
            user.role === "seller" &&
            user.sellerStatus !== "approved"
        ) {
            return res.status(403).json({
                message: "Your seller account is not approved"
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};
