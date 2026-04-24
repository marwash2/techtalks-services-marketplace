import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as categoryService from "@/services/category.service";
import { updateCategorySchema } from "@/lib/validations/category.validation";

// GET CATEGORY BY ID
export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = params;

  const category = await categoryService.getCategoryById(id);

  return Response.json(
    successResponse({ category })
  );
});

// UPDATE CATEGORY
export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = params;

  const body = await req.json();
  const validated = updateCategorySchema.parse(body);

  const category = await categoryService.updateCategory(id, validated);

  return Response.json(
    successResponse(category, MESSAGES.SUCCESS.UPDATE)
  );
});

// DELETE CATEGORY
export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = params;

  await categoryService.deleteCategory(id);

  return Response.json(
    successResponse(null, MESSAGES.SUCCESS.DELETE)
  );
});