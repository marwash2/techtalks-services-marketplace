import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as serviceService from "@/services/service.service";
import { createServiceSchema } from "@/lib/validations/service.validation";
import { requireAuth } from "@/lib/auth-utils";

export const GET = withApiHandler(async (req) => {
  // Public endpoint for service listing
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(
    searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
  );

  // ✅ from filters UI
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const location = searchParams.get("location") || undefined;
  const maxPrice = searchParams.get("maxPrice");

  const filters: {
    search?: string;
    category?: string;
    location?: string;
    price?: number;
  } = {};

  if (search) filters.search = search;
  if (category) filters.category = category;
  if (location) filters.location = location;
  if (maxPrice) filters.price = Number(maxPrice);

  const result = await serviceService.getAllServices(page, limit, filters);

  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const session = await requireAuth(req, ["provider", "admin"]);
  const body = await req.json();
  const validated = createServiceSchema.parse(body);
  const service = await serviceService.createService(validated);
  return Response.json(successResponse(service, MESSAGES.SUCCESS.CREATE), {
    status: 201,
  });
});
