import { Document, Types } from "mongoose";
import { IReview } from "./review";

export interface IProvider extends Document {
  userId: Types.ObjectId;
  businessName: string;
  description: string;
  location: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  providerStatus: "pending" | "approved" | "rejected"; // add this
  services: Types.ObjectId[];
  reviews: IReview[]; // embedded — loaded with provider in one query
  createdAt: Date;
  updatedAt: Date;
}
