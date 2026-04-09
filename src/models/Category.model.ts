import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "@/types/category";

const CategorySchema = new Schema<ICategory>(
  {
    name:     { type: String, required: true },
    slug:     { type: String, required: true, unique: true },
    icon:     { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null }, // null = top-level
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);

export default Category;