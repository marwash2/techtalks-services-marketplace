import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { MESSAGES } from "@/constants/config";
import * as reviewService from "@/services/review.service";
import { updateReviewSchema } from "@/lib/validations/review.validation";

// GET /api/reviews/[id] — public
export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const review = await reviewService.getReviewById(id);
  return Response.json(successResponse(review));
});

// PUT /api/reviews/[id] — owner only
export const PUT = withApiHandler(async (req, { params }) => {
  const sessionUser = await requireSession();
  const { id }      = await params;

  const body      = await req.json();
  const validated = updateReviewSchema.parse(body);

  const review = await reviewService.updateReview(
    id,
    sessionUser.id,
    sessionUser.role,
    validated
  );
  return Response.json(successResponse(review, MESSAGES.SUCCESS.UPDATE));
});

// DELETE /api/reviews/[id] — owner or admin
export const DELETE = withApiHandler(async (_req, { params }) => {
  const sessionUser = await requireSession();
  const { id }      = await params;

  await reviewService.deleteReview(id, sessionUser.id, sessionUser.role);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});