import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as providerService from "@/services/provider.service";
import { createProviderSchema } from "@/lib/validations/provider.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));

  const result = await providerService.getAllProviders(page, limit);
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createProviderSchema.parse(body);
  const provider = await providerService.createProvider(validated);
  return Response.json(successResponse(provider, MESSAGES.SUCCESS.CREATE), { status: 201 });
});