import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as providerService from "@/services/provider.service";
import * as userService from "@/services/user.service";
import { createProviderSchema } from "@/lib/validations/provider.validation";
import { requireAuth } from "@/lib/auth-utils";

export const GET = withApiHandler(async (req) => {
  await requireAuth(req, ["admin", "provider"]);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(
    searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
  );

  const result = await providerService.getAllProviders(page, limit);
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  await requireAuth(req, ["admin"]);
  const body = await req.json();
  const validated = createProviderSchema.parse(body);
  const provider = await providerService.createProvider(validated);
  return Response.json(successResponse(provider, MESSAGES.SUCCESS.CREATE), {
    status: 201,
  });
});

export const PUT = withApiHandler(async (req) => {
  const session = await requireAuth(req, ["user", "provider"]);
  if (!session.user.id) {
    throw new Error("Unable to identify current user");
  }

  const user = await userService.updateUser(session.user.id, {
    role: "provider",
  });

  return Response.json(successResponse(user, MESSAGES.SUCCESS.UPDATE));
});
