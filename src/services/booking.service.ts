import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/schemas/Booking.schema";
import { BOOKING_STATUS, MESSAGES, PAGINATION } from "@/constants/config";

type BookingFilters = {
  userId?: string;
  providerId?: string;
  status?: string;
};

type CreateBookingInput = {
  userId: string;
  providerId: string;
  serviceId: string;
  date: string | Date;
  notes?: string | null;
  status?: string;
};

type UpdateBookingInput = Partial<CreateBookingInput>;

// Get all bookings with pagination and filters
export async function getAllBookings(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: BookingFilters = {},
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: BookingFilters = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.providerId) query.providerId = filters.providerId;
  if (filters.status) query.status = filters.status;

  const bookings = await Booking.find(query)
    .populate("userId", "name email")
    .populate("providerId", "businessName location")
    .populate("serviceId", "title price")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Booking.countDocuments(query);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Create new booking
export async function createBooking(bookingData: CreateBookingInput) {
  await connectDB();

  const booking = new Booking({
    ...bookingData,
    status: bookingData.status || BOOKING_STATUS.PENDING,
  });
  await booking.save();

  return booking;
}

// Get booking by ID
export async function getBookingById(id: string) {
  await connectDB();

  const booking = await Booking.findById(id).populate(
    "userId providerId serviceId",
  );
  if (!booking) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return booking;
}

// Update booking
export async function updateBooking(
  id: string,
  bookingData: UpdateBookingInput,
) {
  await connectDB();

  const booking = await Booking.findByIdAndUpdate(id, bookingData, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return booking;
}

// Delete booking
export async function deleteBooking(id: string) {
  await connectDB();

  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return booking;
}
