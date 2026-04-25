import { Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" |"completed"| "done" | "cancelled";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  status: BookingStatus;
  date: Date;
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}