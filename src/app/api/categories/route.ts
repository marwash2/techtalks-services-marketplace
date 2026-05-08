import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as categoryService from "@/services/category.service";
import { createCategorySchema } from "@/lib/validations/category.validation";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/categories — public
export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1")
  );
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGINATION.DEFAULT_LIMIT)))
  );

  const result = await categoryService.getAllCategories(page, limit);
  return Response.json(successResponse(result));
});

// POST /api/categories — admin only
export const POST = withApiHandler(async (req) => {
  await requireAuth(req, ["admin"]);

  const body      = await req.json();
  const validated = createCategorySchema.parse(body);

  const category = await categoryService.createCategory(validated);
  return Response.json(
    successResponse(category, MESSAGES.SUCCESS.CREATE),
    { status: 201 }
  );
});