import { Document, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  rating: number; // 1–5, enforced at schema level
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}