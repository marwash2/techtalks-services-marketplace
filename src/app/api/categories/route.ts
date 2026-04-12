import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as categoryService from "@/services/category.service";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));

  const result = await categoryService.getAllCategories(page, limit);
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const category = await categoryService.createCategory(body);
  return Response.json(successResponse(category, MESSAGES.SUCCESS.CREATE), { status: 201 });
});