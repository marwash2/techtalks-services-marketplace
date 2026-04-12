import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as providerService from "@/services/provider.service";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const provider = await providerService.getProviderById(id);
  return Response.json(successResponse(provider));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const provider = await providerService.updateProvider(id, body);
  return Response.json(successResponse(provider, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await providerService.deleteProvider(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});