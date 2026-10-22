import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, sellerRegisterSchema } from "../validators/authValidators.js";


export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.validatedBody;
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone
        });

        // Generate JWT
        const token = jwt.sign(
            {
                userId: createdUser._id,
                role: createdUser.role
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "1d"
            }
        );

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role
            },
            token
        });
    } catch (error) {
        // Handle duplicate email conflicts
        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Keep internal error details out of API responses
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Error creating user"
        });
    }
};

export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, phone, storeName } = req.validatedBody;

    // 2. Check whether email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create seller account with pending approval
    const createdSeller = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      storeName,
      role: "seller",
      sellerStatus: "pending",
      isActive: true
    });

    // 5. Return success without issuing a JWT
    return res.status(201).json({
      message: "Seller application submitted successfully. Awaiting admin approval.",
      seller: {
        id: createdSeller._id,
        name: createdSeller.name,
        email: createdSeller.email,
        storeName: createdSeller.storeName,
        sellerStatus: createdSeller.sellerStatus
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    console.error("Seller registration error:", error);

    return res.status(500).json({
      message: "Unable to submit seller application"
    });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.validatedBody;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Prevent disabled accounts from logging in
if (!user.isActive) {
    return res.status(403).json({
        message: "Your account has been deactivated. Please contact support."
    });
}

// Only approved sellers can log in
if (user.role === "seller") {
    if (user.sellerStatus === "pending") {
        return res.status(403).json({
            message: "Your seller application is awaiting admin approval."
        });
    }

    if (user.sellerStatus === "rejected") {
        return res.status(403).json({
            message: "Your seller application has been rejected."
        });
    }

    if (user.sellerStatus !== "approved") {
        return res.status(403).json({
            message: "Your seller account is not approved."
        });
    }
}

        const token = jwt.sign(
            {
               userId: user._id,
               role: user.role
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "1d"
            }        
        );

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });       
    }catch ( error ) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Error logging in user"  
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            '-password'
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
    console.error("Error fetching profile:", error);

    return res.status(500).json({
        message: "Error fetching profile",
        error: error.message
    });
}
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.validatedBody;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name,
          phone
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update profile"
    });
  }
};
