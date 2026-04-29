import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as favoriteService from "@/services/favorite.service";
import { z } from "zod";

const addFavoriteSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
});

// GET /api/favorites — returns the current user's favorited services
export const GET = withApiHandler(async (req) => {
  const sessionUser = await requireSession();
  const { searchParams } = new URL(req.url);

  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGINATION.DEFAULT_LIMIT)))
  );

  const result = await favoriteService.getUserFavorites(sessionUser.id, page, limit);
  return Response.json(successResponse(result));
});

// POST /api/favorites — add a service to favorites
export const POST = withApiHandler(async (req) => {
  const sessionUser = await requireSession();

  const body      = await req.json();
  const { serviceId } = addFavoriteSchema.parse(body);

  const favorite = await favoriteService.addFavorite(sessionUser.id, serviceId);
  return Response.json(successResponse(favorite, MESSAGES.SUCCESS.CREATE), { status: 201 });
});