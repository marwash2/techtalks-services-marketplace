import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date,
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },

    avatar: { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Provider" }],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
