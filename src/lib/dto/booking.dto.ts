import { Types } from "mongoose";

interface BookingDocument {
  _id: Types.ObjectId;
  userId: any;
  providerId: any;
  serviceId: any;
  date: string;
  time: string;
  status: string;
  price: number;
  notes?: string;
  paymentStatus?: string;
  paymentIntentId?: string | null;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function toBookingDTO(booking: BookingDocument) {
  const serviceId  = booking.serviceId;
  const providerId = booking.providerId;

  return {
    id: booking._id.toString(),

    // ── service ───────────────────────────────────────────────────────────────
    service:
      serviceId && typeof serviceId === "object" && serviceId._id
        ? {
            id:       serviceId._id.toString(),
            title:    serviceId.title,
            price:    serviceId.price,
            duration: serviceId.duration,
          }
        : serviceId,

    // ── provider ──────────────────────────────────────────────────────────────
    provider:
      providerId && typeof providerId === "object" && providerId._id
        ? {
            id:           providerId._id.toString(),
            businessName: providerId.businessName,
            location:     providerId.location,
          }
        : providerId,

    // ── user ──────────────────────────────────────────────────────────────────
    userId: booking.userId,

    date:   booking.date,
    time:   booking.time,
    status: booking.status,
    price:  booking.price,
    notes:  booking.notes,

    // ── payment ───────────────────────────────────────────────────────────────
    paymentStatus:   booking.paymentStatus   ?? "unpaid",
    paymentIntentId: booking.paymentIntentId ?? null,
    paidAt:          booking.paidAt          ?? null,
    // ─────────────────────────────────────────────────────────────────────────

    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export function toBookingListDTO(bookings: BookingDocument[]) {
  return bookings.map(toBookingDTO);
}