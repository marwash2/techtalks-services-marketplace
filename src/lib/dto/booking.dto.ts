import { Types } from "mongoose";

interface BookingDocument {
  _id: Types.ObjectId;
  userId: any;
  providerId: any;
  serviceId: any;
  date: Date;
  status: string;
  price: number;
  notes?: string;
  createdAt?: Date;
}

export function toBookingDTO(booking: BookingDocument) {
  return {
    id: booking._id.toString(),
    userId: booking.userId,
    providerId: booking.providerId,
    serviceId: booking.serviceId,
    date: booking.date,
    status: booking.status,
    price: booking.price,
    notes: booking.notes,
    createdAt: booking.createdAt,
  };
}

export function toBookingListDTO(bookings: BookingDocument[]) {
  return bookings.map(toBookingDTO);
}