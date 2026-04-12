import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as userService from "@/services/user.service";
import { createUserSchema } from "@/lib/validations/user.validation";

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createUserSchema.parse(body);
  const user = await userService.createUser(validated);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.CREATE), { status: 201 });
});