
import multer from "multer";

export const notFoundHandler = (req, res, next) => {
    return res.status(404).json({
        message: "API endpoint not found"
    });
};

export const errorHandler = (err, req, res, next) => {
    console.error("Backend error:", err);

    if (res.headersSent) {
        return next(err);
    }

    // Multer upload errors
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "Each image must be 5MB or smaller"
            });
        }

        if (err.code === "LIMIT_FILE_COUNT" ||
            err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Maximum 5 images allowed using the images field"
            });
        }

        return res.status(400).json({
            message: "Invalid image upload"
        });
    }

    // Unsupported image formats from Multer fileFilter
    if (
        err.message ===
        "Only JPEG, PNG, and WebP images are allowed"
    ) {
        return res.status(400).json({
            message: "Only JPEG, PNG, and WebP images are allowed"
        });
    }

    // Mongoose optimistic concurrency conflicts
    if (err.name === "VersionError") {
        return res.status(409).json({
            message:
                "This product was modified by another request. Please refresh and try again."
        });
    }

    // Invalid MongoDB document IDs
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid resource ID"
        });
    }

    // MongoDB duplicate key errors
    if (err.code === 11000) {
        return res.status(409).json({
            message: "A record with these details already exists"
        });
    }

    // Request body parsing errors
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body too large"
        });
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON request body"
        });
    }

    // Other application errors
    const statusCode = Number(err.statusCode || err.status);

    const safeStatus =
        Number.isInteger(statusCode) &&
        statusCode >= 400 &&
        statusCode < 600
            ? statusCode
            : 500;

    return res.status(safeStatus).json({
        message:
            safeStatus >= 500
                ? "Internal server error"
                : safeStatus === 413
                    ? "Request body too large"
                    : safeStatus === 400
                        ? "Invalid request"
                        : "Request failed"
    });
};
