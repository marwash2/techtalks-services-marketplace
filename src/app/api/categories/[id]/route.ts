import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as categoryService from "@/services/category.service";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const category = await categoryService.getCategoryById(id);
  return Response.json(successResponse(category));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const category = await categoryService.updateCategory(id, body);
  return Response.json(successResponse(category, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await categoryService.deleteCategory(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});