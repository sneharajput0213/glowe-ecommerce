import { reconcileExpiredPayments } from "./services/paymentExpiryService.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
];

const missingEnvVars = requiredEnvVars.filter(
    (key) => !process.env[key]?.trim()
);

if (missingEnvVars.length > 0) {
    console.error(
        `Missing environment variables: ${missingEnvVars.join(", ")}`
    );

    process.exit(1);
}

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);

            let isReconciling = false;

            const runReconciliation = async () => {
                if (isReconciling) return;

                isReconciling = true;

                try {
                    await reconcileExpiredPayments();
                } catch (error) {
                    console.error(
                        "Scheduled payment reconciliation failed:",
                        error.message
                    );
                } finally {
                    isReconciling = false;
                }
            };

            // Run once when the server starts
            void runReconciliation();

            // Check every 10 minutes
            setInterval(runReconciliation, 10 * 60 * 1000);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    });
