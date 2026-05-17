import { Document, Types } from "mongoose";

export type ReviewUserRef =
  | Types.ObjectId
  | {
      _id: Types.ObjectId;
      name?: string;
      email?: string;
    };

export type ReviewEntityRef<TLabel extends string> =
  | Types.ObjectId
  | ({ _id: Types.ObjectId } & Partial<Record<TLabel, string>>);

export interface IReview extends Document {
  userId: ReviewUserRef;
  providerId: ReviewEntityRef<"businessName">;
  serviceId: ReviewEntityRef<"title">;
  rating: number; // 1-5, enforced at schema level
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}
