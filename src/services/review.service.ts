import { connectDB } from "@/lib/db";
import { Review } from "@/lib/schemas/Review.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toReviewDTO, toReviewListDTO } from "@/lib/dto/review.dto";

type ReviewFilters = {
  providerId?: string;
  serviceId?: string;
};

type CreateReviewInput = {
  userId: string;
  providerId: string;
  serviceId: string;
  rating: number;
  comment?: string;
};

type UpdateReviewInput = Partial<{ rating: number; comment: string }>;

export async function getAllReviews(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: ReviewFilters = {}
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: Record<string, string> = {};

  if (filters.providerId) query.providerId = filters.providerId;
  if (filters.serviceId) query.serviceId = filters.serviceId;

  const reviews = await Review.find(query)
    .populate("userId", "name email")
    .populate("providerId", "businessName")
    .populate("serviceId", "title")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Review.countDocuments(query);

  return {
    reviews: toReviewListDTO(reviews),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createReview(reviewData: CreateReviewInput) {
  await connectDB();

  const { userId, providerId, serviceId, rating } = reviewData;

  if (!userId || !providerId || !serviceId || !rating) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError("Rating must be between 1 and 5", 400);
  }

  const review = new Review(reviewData);
  await review.save();

  return toReviewDTO(review);
}

export async function getReviewById(id: string) {
  await connectDB();

  const review = await Review.findById(id)
    .populate("userId", "name email")
    .populate("providerId", "businessName")
    .populate("serviceId", "title");
  if (!review) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toReviewDTO(review);
}

export async function updateReview(id: string, reviewData: UpdateReviewInput) {
  await connectDB();

  if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
    throw new ApiError("Rating must be between 1 and 5", 400);
  }

  const review = await Review.findByIdAndUpdate(id, reviewData, {
    new: true,
    runValidators: true,
  });
  if (!review) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toReviewDTO(review);
}

export async function deleteReview(id: string) {
  await connectDB();

  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toReviewDTO(review);
}