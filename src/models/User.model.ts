import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["user", "provider", "admin"], default: "user" },
    avatar:    { type: String },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Provider" }],
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;