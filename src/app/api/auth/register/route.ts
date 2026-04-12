import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as userService from "@/services/user.service";

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const user = await userService.createUser(body);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.CREATE), { status: 201 });
});