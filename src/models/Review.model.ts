import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "@/types/review";

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// One review per user per service — enforced at the database level.
// This is the single most important constraint in the review system.
ReviewSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

// Efficient lookups for the GET /api/reviews?serviceId= pattern
ReviewSchema.index({ serviceId: 1, createdAt: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);