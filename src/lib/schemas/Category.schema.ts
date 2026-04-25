import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "@/types/category";

export const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    icon: { type: String, required: true },
    parentId: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      default: null }, // null = top-level
  },
  { timestamps: true },
);

