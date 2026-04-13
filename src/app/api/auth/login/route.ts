import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as userService from "@/services/user.service";
import { loginSchema } from "@/lib/validations/user.validation";

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = loginSchema.parse(body);
  const user = await userService.loginUser(validated.email, validated.password);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.LOGIN));
});