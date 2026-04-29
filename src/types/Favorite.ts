import { Document, Types } from "mongoose";

export interface IFavorite extends Document {
  userId:    Types.ObjectId;
  serviceId: Types.ObjectId;
  createdAt: Date;
}