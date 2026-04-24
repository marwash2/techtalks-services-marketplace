import { connectDB } from "@/lib/db";
import { Category } from "@/lib/schemas/Category.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toCategoryDTO, toCategoryListDTO } from "@/lib/dto/category.dto";

type CreateCategoryInput = {
  name: string;
  description?: string;
  icon?: string;
  slug?: string;
};

type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function getAllCategories(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const categories = await Category.find().skip(skip).limit(limit).exec();
  const total = await Category.countDocuments();

  return {
    categories: toCategoryListDTO(categories),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createCategory(categoryData: CreateCategoryInput) {
  await connectDB();

  const { name, description, icon, slug } = categoryData;

  if (!name) throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);

  const category = new Category({
    name,
    description,
    icon,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
  });
  await category.save();

  return toCategoryDTO(category);
}

export async function getCategoryById(id: string) {
  await connectDB();

  const category = await Category.findById(id);
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toCategoryDTO(category);
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug });
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);
  return toCategoryDTO(category);
}

export async function updateCategory(
  id: string,
  categoryData: UpdateCategoryInput,
) {
  await connectDB();

  const category = await Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toCategoryDTO(category);
}

export async function deleteCategory(id: string) {
  await connectDB();

  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toCategoryDTO(category);
}
