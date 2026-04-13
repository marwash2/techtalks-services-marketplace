import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";

export const POST = withApiHandler(async () => {
  return Response.json(successResponse(null, MESSAGES.SUCCESS.LOGOUT));
});