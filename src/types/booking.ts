import { Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IBooking extends Document {
  userId:     Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId:  Types.ObjectId;
  status:     BookingStatus;
  date:       string;   // "2025-05-20" — simple date string, not Date object
  time:       string;   // "10:00 AM"
  price:      number;
  notes?:     string;
  createdAt:  Date;
  updatedAt:  Date;
}