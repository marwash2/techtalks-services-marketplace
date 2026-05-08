import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import * as categoryService from "@/services/category.service";

// GET /api/categories/slug/[slug] — public
export const GET = withApiHandler(async (_req, { params }) => {
  const { slug } = await params;

  const category = await categoryService.getCategoryBySlug(slug);
  return Response.json(successResponse(category));
});