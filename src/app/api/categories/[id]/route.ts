import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as categoryService from "@/services/category.service";
import { updateCategorySchema } from "@/lib/validations/category.validation";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/categories/[id] — public
export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;  // ← await required in App Router

  const category = await categoryService.getCategoryById(id);
  return Response.json(successResponse(category));
});

// PUT /api/categories/[id] — admin only
export const PUT = withApiHandler(async (req, { params }) => {
  await requireAuth(req, ["admin"]);  // ← was missing entirely

  const { id }    = await params;
  const body      = await req.json();
  const validated = updateCategorySchema.parse(body);

  const category = await categoryService.updateCategory(id, validated);
  return Response.json(successResponse(category, MESSAGES.SUCCESS.UPDATE));
});

// DELETE /api/categories/[id] — admin only
export const DELETE = withApiHandler(async (req, { params }) => {
  await requireAuth(req, ["admin"]);  // ← was missing entirely

  const { id } = await params;

  await categoryService.deleteCategory(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});