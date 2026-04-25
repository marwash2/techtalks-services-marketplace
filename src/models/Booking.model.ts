import mongoose, { Schema, Model } from "mongoose";
import { IBooking } from "@/types/booking";

const BookingSchema = new Schema<IBooking>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "User",     required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    serviceId:  { type: Schema.Types.ObjectId, ref: "Service",  required: true },
    status:     {
      type: String,
      enum: ["pending", "confirmed", "done", "completed","cancelled"],
      default: "pending",
    },
    date:  { type: Date,   required: true },
    price: { type: Number, required: true },
      notes: { type: String, default: null },
    
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;