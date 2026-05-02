import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { MESSAGES } from "@/constants/config";
import * as favoriteService from "@/services/favorite.service";

// GET /api/favorites/[serviceId] — check if the current user has favorited this service
export const GET = withApiHandler(async (_req, { params }) => {
  const sessionUser    = await requireSession();
  const { serviceId }  = await params;

  const result = await favoriteService.isFavorited(sessionUser.id, serviceId);
  return Response.json(successResponse(result));
});

// DELETE /api/favorites/[serviceId] — remove from favorites
export const DELETE = withApiHandler(async (_req, { params }) => {
  const sessionUser    = await requireSession();
  const { serviceId }  = await params;

  await favoriteService.removeFavorite(sessionUser.id, serviceId);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});