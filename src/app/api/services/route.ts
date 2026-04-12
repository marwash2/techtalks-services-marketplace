import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as serviceService from "@/services/service.service";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));
  const providerId = searchParams.get("providerId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  const result = await serviceService.getAllServices(page, limit, { providerId, categoryId });
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const service = await serviceService.createService(body);
  return Response.json(successResponse(service, MESSAGES.SUCCESS.CREATE), { status: 201 });
});