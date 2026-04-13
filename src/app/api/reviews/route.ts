import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as reviewService from "@/services/review.service";
import { createReviewSchema } from "@/lib/validations/review.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));
  const providerId = searchParams.get("providerId") || undefined;
  const serviceId = searchParams.get("serviceId") || undefined;

  const result = await reviewService.getAllReviews(page, limit, { providerId, serviceId });
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createReviewSchema.parse(body);
  const review = await reviewService.createReview(validated);
  return Response.json(successResponse(review, MESSAGES.SUCCESS.CREATE), { status: 201 });
});