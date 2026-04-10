import { Document, Types } from "mongoose";
import { IReview } from "./review";

export interface IProvider extends Document {
  userId: Types.ObjectId;
  bio: string;
  location: string;
  rating: number;
  services: Types.ObjectId[];
  reviews: IReview[];       // embedded — loaded with provider in one query
  createdAt: Date;
  updatedAt: Date;
}