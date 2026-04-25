import mongoose, { Model } from "mongoose";
import { IBooking } from "@/types/booking";
import  bookingSchema  from "@/lib/schemas/Booking.schema";

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;