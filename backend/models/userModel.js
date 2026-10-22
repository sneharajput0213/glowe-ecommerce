import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false
  },
  password:{
    type: String,
    required: true
  },
  role:{
    required: true,
    type: String,
    enum: ["customer", "admin", "seller"],
    default: "customer"
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  sellerStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: undefined
  },
  storeName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: undefined
  }
})

const User = mongoose.model("User", userSchema);
export default User;