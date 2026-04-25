import mongoose from "mongoose";
import userSchema from "@/lib/schemas/User.schema";

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);