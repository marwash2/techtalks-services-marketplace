import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "pending_payment", "completed", "cancelled"],
      default: "pending",
    },

    // ── Payment fields ────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    // ─────────────────────────────────────────────────────────────────────────

    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Prevents double-booking the same slot at the DB level ─────────────────────
// Partial filter means cancelled/completed bookings don't block the slot.
bookingSchema.index(
  { serviceId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed", "pending_payment"] },
    },
  }
);
// ─────────────────────────────────────────────────────────────────────────────

export default bookingSchema;