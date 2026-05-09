import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category.model";
import { Service } from "@/models/Service.model";
import { ApiError } from "@/lib/api-error";
import { toCategoryDTO, toCategoryListDTO } from "@/lib/dto/category.dto";
import { slugify } from "@/lib/utils/slugify";
import { MESSAGES, PAGINATION } from "@/constants/config";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validations/category.validation";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Generates a unique slug by appending a numeric suffix if the base slug
 * is already taken. e.g. "plumbing" → "plumbing-2" → "plumbing-3"
 */
async function generateUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };

    const exists = await Category.exists(query);
    if (!exists) return slug;

    suffix++;
    slug = `${slugify(base)}-${suffix}`;
  }
}

/**
 * Injects serviceCount into each category using a single aggregation lookup.
 * Far more efficient than N individual countDocuments calls.
 */
async function withServiceCounts(categoryIds: mongoose.Types.ObjectId[]) {
  const counts = await Service.aggregate([
    { $match: { categoryId: { $in: categoryIds } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>(
    counts.map((c) => [c._id.toString(), c.count])
  );

  return countMap;
}

// ── Public service functions ───────────────────────────────────────────────────

export async function getAllCategories(
  page  = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT
) {
  await connectDB();

  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Category.countDocuments(),
  ]);

  // Inject serviceCount for all categories in one aggregation
  const ids = categories.map((c) => c._id as mongoose.Types.ObjectId);
  const countMap = await withServiceCounts(ids);

  const categoriesWithCount = categories.map((c) => ({
    ...c,
    serviceCount: countMap.get(c._id.toString()) ?? 0,
  }));

  return {
    categories: toCategoryListDTO(categoriesWithCount),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getCategoryById(id: string) {
  await connectDB();

  const category = await Category.findById(id).lean().exec();
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  const countMap = await withServiceCounts([category._id as mongoose.Types.ObjectId]);

  return toCategoryDTO({
    ...category,
    serviceCount: countMap.get(category._id.toString()) ?? 0,
  });
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();

  const category = await Category.findOne({ slug }).lean().exec();
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  const countMap = await withServiceCounts([category._id as mongoose.Types.ObjectId]);

  return toCategoryDTO({
    ...category,
    serviceCount: countMap.get(category._id.toString()) ?? 0,
  });
}

export async function createCategory(input: CreateCategoryInput) {
  await connectDB();

  // Check for duplicate name explicitly for a clean 409 instead of raw Mongo error
  const nameExists = await Category.exists({
    name: { $regex: new RegExp(`^${input.name}$`, "i") },
  });
  if (nameExists) throw new ApiError("Category name already exists", 409);

  // Generate slug from provided value or from name
  const slug = input.slug
    ? await generateUniqueSlug(input.slug)
    : await generateUniqueSlug(input.name);

  // Validate parentId exists if provided
  if (input.parentId) {
    const parentExists = await Category.exists({ _id: input.parentId });
    if (!parentExists) throw new ApiError("Parent category not found", 404);
  }

  try {
    const category = await Category.create({
      name:        input.name,
      slug,
      description: input.description,
      icon:        input.icon,
      parentId:    input.parentId ?? null,
    });

    return toCategoryDTO({ ...category.toObject(), serviceCount: 0 });
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
      throw new ApiError(`Category ${field} already exists`, 409);
    }
    throw err;
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await connectDB();

  const existing = await Category.findById(id);
  if (!existing) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  // Check name uniqueness if name is being changed
  if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameExists = await Category.exists({
      name: { $regex: new RegExp(`^${input.name}$`, "i") },
      _id:  { $ne: new mongoose.Types.ObjectId(id) },
    });
    if (nameExists) throw new ApiError("Category name already exists", 409);
  }

  // Regenerate slug if name changes (unless slug explicitly provided)
  let slug = input.slug;
  if (!slug && input.name && input.name !== existing.name) {
    slug = await generateUniqueSlug(input.name, id);
  }

  // Validate parentId exists if provided and not self-referencing
  if (input.parentId) {
    if (input.parentId === id) {
      throw new ApiError("Category cannot be its own parent", 400);
    }
    const parentExists = await Category.exists({ _id: input.parentId });
    if (!parentExists) throw new ApiError("Parent category not found", 404);
  }

  const updatePayload: Record<string, unknown> = { ...input };
  if (slug) updatePayload.slug = slug;

  try {
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean().exec();

    const countMap = await withServiceCounts([updated!._id as mongoose.Types.ObjectId]);

    return toCategoryDTO({
      ...updated!,
      serviceCount: countMap.get(updated!._id.toString()) ?? 0,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
      throw new ApiError(`Category ${field} already exists`, 409);
    }
    throw err;
  }
}

export async function deleteCategory(id: string) {
  await connectDB();

  const category = await Category.findById(id);
  if (!category) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  // Option A — Block deletion if services are linked
  const linkedCount = await Service.countDocuments({ categoryId: id });
  if (linkedCount > 0) {
    throw new ApiError(
      `Cannot delete category — ${linkedCount} service${linkedCount > 1 ? "s are" : " is"} assigned to it`,
      400
    );
  }

  // Also block if subcategories exist
  const childCount = await Category.countDocuments({ parentId: id });
  if (childCount > 0) {
    throw new ApiError(
      `Cannot delete category — ${childCount} subcategor${childCount > 1 ? "ies are" : "y is"} assigned to it`,
      400
    );
  }

  await category.deleteOne();

  return toCategoryDTO({ ...category.toObject(), serviceCount: 0 });
}

/**
 * Validates that a categoryId exists — used by service creation.
 * Throws 404 if not found so the caller gets a clean error.
 */
export async function assertCategoryExists(categoryId: string): Promise<void> {
  await connectDB();
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) throw new ApiError("Category not found", 404);
}