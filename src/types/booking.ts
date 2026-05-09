import { Document, Types } from "mongoose";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "pending_payment"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export interface IBooking extends Document {
  userId:     Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId:  Types.ObjectId;
  status:     BookingStatus;
  date:       string;
  time:       string;
  price:      number;
  notes?:     string;

  // ── Payment ─────────────────────────────────────────────────────────────────
  paymentStatus:    PaymentStatus;
  paymentIntentId:  string | null;
  paidAt:           Date | null;
  // ────────────────────────────────────────────────────────────────────────────

  createdAt: Date;
  updatedAt: Date;
}