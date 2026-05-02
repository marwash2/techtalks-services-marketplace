import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as providerService from "@/services/provider.service";
import { providerOnboardingSchema } from "@/lib/validations/provider.validation";
import { requireAuth } from "@/lib/auth-utils";

export const POST = withApiHandler(async (req) => {
  // Ensure user is authenticated and has provider role
  const session = await requireAuth(req, ["provider"]);

  if (!session.user.id) {
    throw new Error("Unable to identify current user");
  }

  const body = await req.json();
  const validated = providerOnboardingSchema.parse(body);

  // Create provider with userId from session
  const provider = await providerService.createProvider({
    userId: session.user.id,
    businessName: validated.businessName,
    location: validated.location,
    description: validated.description,
    avatar: validated.avatar,
  });

  return Response.json(successResponse(provider, MESSAGES.SUCCESS.CREATE), {
    status: 201,
  });
});
