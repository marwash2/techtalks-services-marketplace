import { Types } from "mongoose";

interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  createdAt?: Date;
}

export function toCategoryDTO(category: CategoryDocument) {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    icon: category.icon,
    slug: category.slug,
    createdAt: category.createdAt,
  };
}

export function toCategoryListDTO(categories: CategoryDocument[]) {
  return categories.map(toCategoryDTO);
}