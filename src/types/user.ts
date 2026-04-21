import { Document, Types } from "mongoose";

export type UserRole = "user" | "provider" | "admin";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  resetToken?: string;
  resetTokenExpiry?: Date;
  avatar?: string;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
