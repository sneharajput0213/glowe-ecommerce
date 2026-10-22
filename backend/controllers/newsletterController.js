
import Newsletter from "../models/newsletterModel.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Check whether an email was provided
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    // Normalize and validate the email
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Check for an existing subscriber
    const existingSubscriber = await Newsletter.findOne({
      email: normalizedEmail,
    });

    if (existingSubscriber) {
      return res.status(409).json({
        message: "You're already subscribed to our newsletter!",
      });
    }

    // Save the subscriber
    await Newsletter.create({
      email: normalizedEmail,
    });

    return res.status(201).json({
      message: "Thank you for subscribing to Glowé!",
    });
  } catch (error) {
    // Handle a duplicate email if two requests arrive together
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You're already subscribed to our newsletter!",
      });
    }

    console.error("Newsletter subscription error:", error.message);

    return res.status(500).json({
      message: "Unable to subscribe right now. Please try again later.",
    });
  }
};
