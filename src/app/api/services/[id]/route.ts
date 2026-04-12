import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as serviceService from "@/services/service.service";
import { updateServiceSchema } from "@/lib/validations/service.validation";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const service = await serviceService.getServiceById(id);
  return Response.json(successResponse(service));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = updateServiceSchema.parse(body);
  const service = await serviceService.updateService(id, validated);
  return Response.json(successResponse(service, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await serviceService.deleteService(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});