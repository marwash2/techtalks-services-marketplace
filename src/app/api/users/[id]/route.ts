import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as userService from "@/services/user.service";
import { updateUserSchema } from "@/lib/validations/user.validation";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const user = await userService.getUserById(id);
  return Response.json(successResponse(user));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = updateUserSchema.parse(body); // 👈 Zod validates here
  const user = await userService.updateUser(id, validated);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await userService.deleteUser(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});