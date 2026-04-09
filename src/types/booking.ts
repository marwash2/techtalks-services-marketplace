import { Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  status: BookingStatus;
  date: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}