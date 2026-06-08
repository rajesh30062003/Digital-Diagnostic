import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    avatar: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
