import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as categoryService from "@/services/category.service";
import { createCategorySchema } from "@/lib/validations/category.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));

  const result = await categoryService.getAllCategories(page, limit);
  // Debug log
  console.log("Fetched categories:", result);
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createCategorySchema.parse(body);
  const category = await categoryService.createCategory(validated);
  return Response.json(successResponse(category, MESSAGES.SUCCESS.CREATE), { status: 201 });
});