import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as reviewService from "@/services/review.service";
import { createReviewSchema } from "@/lib/validations/review.validation";

// GET /api/reviews?serviceId=&providerId=&page=&limit=
// Public — no auth required to read reviews
export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGINATION.DEFAULT_LIMIT)))
  );
  const serviceId  = searchParams.get("serviceId")  ?? undefined;
  const providerId = searchParams.get("providerId") ?? undefined;

  const result = await reviewService.getAllReviews(page, limit, { serviceId, providerId });
  return Response.json(successResponse(result));
});

// POST /api/reviews
// Requires authentication. userId is taken from session, not body.
export const POST = withApiHandler(async (req) => {
  const sessionUser = await requireSession();

  const body      = await req.json();
  const validated = createReviewSchema.parse(body);

  const review = await reviewService.createReview(sessionUser.id, validated);
  return Response.json(successResponse(review, MESSAGES.SUCCESS.CREATE), { status: 201 });
});