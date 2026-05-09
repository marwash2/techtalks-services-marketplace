import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review.model";
import { Service } from "@/models/Service.model";
import { Provider } from "@/models/Provider.model";
import { ApiError } from "@/lib/api-error";
import { toReviewDTO, toReviewListDTO } from "@/lib/dto/review.dto";
import { MESSAGES, PAGINATION } from "@/constants/config";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "@/lib/validations/review.validation";

// ── Stat sync ──────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

async function syncServiceStats(serviceId: string): Promise<void> {
  const [result] = await Review.aggregate([
    { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
    {
      $group: {
        _id: "$serviceId",
        averageRating: { $avg: "$rating" },
        reviewCount:   { $sum: 1 },
      },
    },
  ]).exec();

  if (result) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(result.averageRating * 10) / 10,
      reviewCount:   result.reviewCount,
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: 0,
      reviewCount:   0,
    });
  }
}

async function syncProviderStats(providerId: string): Promise<void> {
  const [result] = await Review.aggregate([
    { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: "$providerId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]).exec();

  if (result) {
    await Provider.findByIdAndUpdate(providerId, {
      rating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.reviewCount,
    });
  } else {
    await Provider.findByIdAndUpdate(providerId, {
      rating: 0,
      totalReviews: 0,
    });
  }
}

function buildStatsMatch(filters: ReviewFilters) {
  const match: Record<string, mongoose.Types.ObjectId> = {};

  if (filters.serviceId && mongoose.Types.ObjectId.isValid(filters.serviceId)) {
    match.serviceId = new mongoose.Types.ObjectId(filters.serviceId);
  }

  if (
    filters.providerId &&
    mongoose.Types.ObjectId.isValid(filters.providerId)
  ) {
    match.providerId = new mongoose.Types.ObjectId(filters.providerId);
  }

  return match;
}
// ── Populate helper ────────────────────────────────────────────────────────────

function withPopulate(query: any) {
  return query
    .populate("userId", "name email")
    .populate("providerId", "businessName")
    .populate("serviceId", "title");
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ReviewFilters = {
  serviceId?: string;
  providerId?: string;
};

// ── Service functions ──────────────────────────────────────────────────────────

export async function getAllReviews(
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: ReviewFilters = {}
) {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters.serviceId) query.serviceId = filters.serviceId;
  if (filters.providerId) query.providerId = filters.providerId;

  const skip = (page - 1) * limit;

  const [reviews, total, stats] = await Promise.all([
    withPopulate(
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    )
      .lean()
      .exec(),

    Review.countDocuments(query),

    Review.aggregate([
      { $match: buildStatsMatch(filters) },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]).exec(),
  ]);

  const summary = stats[0]
    ? {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      }
    : {
        averageRating: 0,
        reviewCount: 0,
      };

  return {
    reviews: toReviewListDTO(reviews),
    summary,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getReviewById(id: string) {
  await connectDB();

  const review = await withPopulate(Review.findById(id)).lean().exec();

  if (!review) {
    throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);
  }

  return toReviewDTO(review);
}

export async function createReview(
  sessionUserId: string,
  input: CreateReviewInput
) {
  await connectDB();

  const serviceExists = await Service.exists({
    _id: input.serviceId,
  });

  if (!serviceExists) {
    throw new ApiError("Service not found", 404);
  }

  try {
    const review = await Review.create({
      userId: sessionUserId,
      providerId: input.providerId,
      serviceId: input.serviceId,
      rating: input.rating,
      comment: input.comment,
    });

    await syncServiceStats(input.serviceId);
    await syncProviderStats(input.providerId);

    const populated = await withPopulate(
      Review.findById(review._id)
    )
      .lean()
      .exec();

    return toReviewDTO(populated);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ApiError(
        "You have already reviewed this service",
        409
      );
    }

    throw err;
  }
}

export async function updateReview(
  id: string,
  sessionUserId: string,
  sessionUserRole: string,
  input: UpdateReviewInput
) {
  await connectDB();

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);
  }

  if (review.userId.toString() !== sessionUserId) {
    throw new ApiError(MESSAGES.ERROR.FORBIDDEN, 403);
  }

  const updated = await Review.findByIdAndUpdate(
    id,
    { $set: input },
    {
      new: true,
      runValidators: true,
    }
  );

  await syncServiceStats(review.serviceId.toString());
  await syncProviderStats(review.providerId.toString());

  const populated = await withPopulate(
    Review.findById(updated!._id)
  )
    .lean()
    .exec();

  return toReviewDTO(populated);
}

export async function deleteReview(
  id: string,
  sessionUserId: string,
  sessionUserRole: string
) {
  await connectDB();

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);
  }

  const isOwner =
    review.userId.toString() === sessionUserId;

  const isAdmin =
    sessionUserRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(MESSAGES.ERROR.FORBIDDEN, 403);
  }

  const serviceId =
    review.serviceId.toString();
  const providerId =
    review.providerId.toString();

  await review.deleteOne();

  await syncServiceStats(serviceId);
  await syncProviderStats(providerId);

  return { id };
}
