import { Document, Types } from "mongoose";
 
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "provider" | "admin";
  avatar?: string;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}