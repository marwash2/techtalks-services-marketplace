import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string;
  description?: string | null;
  parentId?: Types.ObjectId; // null = top-level, set = sub-category
  createdAt: Date;
  updatedAt: Date;
}