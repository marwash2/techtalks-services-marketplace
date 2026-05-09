import { Types } from "mongoose";

interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string | null;
  icon: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
  serviceCount?: number; // injected by service layer via aggregation
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string | null;
  icon: string;
  slug: string;
  parentId?: string | null;
  serviceCount?: number;
  createdAt?: Date;
}

export function toCategoryDTO(category: CategoryDocument): CategoryDTO {
  return {
    id:           category._id.toString(),
    name:         category.name,
    description:  category.description,
    icon:         category.icon,
    slug:         category.slug,
    parentId:     category.parentId?.toString() ?? null,
    serviceCount: category.serviceCount,
    createdAt:    category.createdAt,
  };
}

export function toCategoryListDTO(categories: CategoryDocument[]): CategoryDTO[] {
  return categories.map(toCategoryDTO);
}