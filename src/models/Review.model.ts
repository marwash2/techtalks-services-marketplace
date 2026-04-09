import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "@/types/review";

// Reviews are embedded inside Provider — no standalone collection.
// This schema is exported and reused inside Provider.model.ts.
export const ReviewSchema = new Schema<IReview>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// If you ever need a standalone Review model (e.g. for admin queries), export it here:
const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);

export default Review;