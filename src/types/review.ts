import { Document, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  rating: number;           // 1–5
  comment: string;
  createdAt: Date;
}