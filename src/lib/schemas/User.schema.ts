import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    bio: { type: String, default: null },
    resetToken: String,
    resetTokenExpiry: Date,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Provider" }],
  },
  { timestamps: true },
);

export default userSchema;