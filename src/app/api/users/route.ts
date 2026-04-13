import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as userService from "@/services/user.service";
import { createUserSchema } from "@/lib/validations/user.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));

  const result = await userService.getAllUsers(page, limit);
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createUserSchema.parse(body); // 👈 Zod validates here
  const user = await userService.createUser(validated);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.CREATE), { status: 201 });
});