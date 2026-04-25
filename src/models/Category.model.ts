import mongoose, { Model } from "mongoose";
import { ICategory } from "@/types/category";
import { CategorySchema } from "@/lib/schemas/Category.schema";

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;