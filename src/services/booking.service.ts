import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking.model";
import { Provider } from "@/models/Provider.model";
import { MESSAGES, PAGINATION, BOOKING_STATUS } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toBookingDTO, toBookingListDTO } from "@/lib/dto/booking.dto";

type BookingFilters = {
  userId?: string;
  providerId?: string;
  status?: string;
};
type ProviderLean = {
  _id: string;
};
type CreateBookingInput = {
  userId:     string;
  providerId: string;
  serviceId:  string;
  date:       string;
  time:       string;  // ← added
  price:      number;
  notes?:     string;
};

type UpdateBookingInput = {
  status?: string;
  notes?:  string;
};

export async function getAllBookings(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: BookingFilters = {}
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: Record<string, string> = {};

  if (filters.userId)     query.userId     = filters.userId;
  if (filters.providerId) {
    let provider = await Provider.findOne({ userId: filters.providerId }).select("_id").lean();
    if (!provider) {
      provider = await Provider.findById(filters.providerId).select("_id").lean();
    }
    if (!provider?._id) {
      return {
        bookings: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }
    query.providerId = String(provider._id);
  }
  if (filters.status)     query.status     = filters.status;

  const bookings = await Booking.find(query)
    .populate("userId",     "name email")
    .populate("providerId", "businessName location")
    .populate("serviceId",  "title price duration")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Booking.countDocuments(query);

  return {
    bookings: toBookingListDTO(bookings),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createBooking(bookingData: CreateBookingInput) {
  await connectDB();

  const { userId, providerId, serviceId, date, time } = bookingData;

  if (!userId || !providerId || !serviceId || !date || !time) {
    throw new ApiError("Missing required booking fields", 400);
  }

  const booking = new Booking({
    ...bookingData,
    status: BOOKING_STATUS.PENDING,
  });

  await booking.save();

  return toBookingDTO(booking);
}

export async function getBookingById(id: string) {
  await connectDB();

  const booking = await Booking.findById(id)
    .populate("userId",     "name email")
    .populate("providerId", "businessName location")
    .populate("serviceId",  "title price duration");

  if (!booking) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toBookingDTO(booking);
}

export async function updateBooking(id: string, bookingData: UpdateBookingInput) {
  await connectDB();

  const booking = await Booking.findByIdAndUpdate(id, bookingData, {
    new: true,
    runValidators: true,
  });

  if (!booking) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toBookingDTO(booking);
}

export async function deleteBooking(id: string) {
  await connectDB();

  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toBookingDTO(booking);
}
