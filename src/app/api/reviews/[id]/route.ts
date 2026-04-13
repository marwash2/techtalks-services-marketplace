import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as reviewService from "@/services/review.service";
import { updateReviewSchema } from "@/lib/validations/review.validation";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const review = await reviewService.getReviewById(id);
  return Response.json(successResponse(review));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = updateReviewSchema.parse(body);
  const review = await reviewService.updateReview(id, validated);
  return Response.json(successResponse(review, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await reviewService.deleteReview(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});