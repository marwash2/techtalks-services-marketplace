import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/schemas/Notification.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toNotificationDTO, toNotificationListDTO } from "@/lib/dto/notification.dto";
import { Types } from "mongoose";
import { Provider } from "@/models/Provider.model";
import { User } from "@/models/User.model";
import Booking from "@/models/Booking.model";

type NotificationFilters = {
  userId?: string;
  isRead?: boolean;
};

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
};

type UpdateNotificationInput = Partial<{ isRead: boolean; title: string; message: string }>;

const REMINDER_OFFSETS_HOURS = [24, 6, 3] as const;

function parseBookingDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return null;
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const bookingDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(bookingDate.getTime())) return null;
  bookingDate.setHours(hours, minutes, 0, 0);
  return bookingDate;
}

async function createBookingRemindersForUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return;

  const provider = await Provider.findOne({ userId }).select("_id").lean<{ _id: string }>();
  const providerId = provider?._id ? String(provider._id) : "";

  const bookingQuery: Record<string, unknown> = {
    status: "confirmed",
    $or: [{ userId }],
  };
  if (providerId) {
    (bookingQuery.$or as Array<Record<string, unknown>>).push({ providerId });
  }

  const bookings = await Booking.find(bookingQuery)
    .populate("serviceId", "title")
    .select("_id userId providerId serviceId date time status")
    .lean();

  const now = new Date();

  for (const booking of bookings as Array<any>) {
    const bookingDateTime = parseBookingDateTime(booking.date, booking.time);
    if (!bookingDateTime) continue;

    const isUserOwner = String(booking.userId) === userId;
    const isProviderOwner = providerId ? String(booking.providerId) === providerId : false;
    if (!isUserOwner && !isProviderOwner) continue;

    const serviceTitle =
      booking.serviceId && typeof booking.serviceId === "object"
        ? booking.serviceId.title || "your service"
        : "your service";

    for (const offsetHours of REMINDER_OFFSETS_HOURS) {
      const reminderAt = new Date(bookingDateTime.getTime() - offsetHours * 60 * 60 * 1000);
      if (now < reminderAt || now > bookingDateTime) continue;

      const reminderType = `booking_reminder_${offsetHours}h`;
      const bookingId = String(booking._id);
      const reminderLink = isProviderOwner
        ? `/provider/bookings?bookingId=${bookingId}`
        : `/user/bookings/${bookingId}`;
      const existing = await Notification.findOne({
        userId,
        type: reminderType,
        link: reminderLink,
      }).lean();
      if (existing) continue;

      await createNotification({
        userId,
        title: `Upcoming Booking (${offsetHours}h Reminder)`,
        message: isProviderOwner
          ? `Reminder: You have "${serviceTitle}" in ${offsetHours} hours.`
          : `Reminder: Your booking for "${serviceTitle}" starts in ${offsetHours} hours.`,
        type: reminderType,
        link: reminderLink,
      });
    }
  }
}

async function resolveNotificationRecipientId(rawUserId: string) {
  const candidate = String(rawUserId || "").trim();
  if (!candidate || !Types.ObjectId.isValid(candidate)) return "";

  const user = await User.findById(candidate).select("_id").lean();
  if (!user || Array.isArray(user)) return "";
  if (user._id) return String(user._id);

  const provider = await Provider.findById(candidate).select("userId").lean();
  const providerUserId = (provider as { userId?: unknown } | null)?.userId;
  if (!providerUserId) return "";

  const resolved = String(providerUserId);
  return Types.ObjectId.isValid(resolved) ? resolved : "";
}

export async function getAllNotifications(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: NotificationFilters = {}
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.isRead !== undefined) query.isRead = filters.isRead;

  if (filters.userId) {
    await createBookingRemindersForUser(filters.userId);
  }

  const notifications = await Notification.find(query)
    .populate("userId", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
  const total = await Notification.countDocuments(query);

  return {
    notifications: toNotificationListDTO(notifications),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createNotification(notificationData: CreateNotificationInput) {
  await connectDB();

  const { userId, title, message } = notificationData;

  if (!userId || !title || !message) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  const resolvedUserId = await resolveNotificationRecipientId(userId);
  if (!resolvedUserId) {
    throw new ApiError("Invalid notification recipient", 400);
  }

  const notification = new Notification({
    ...notificationData,
    userId: resolvedUserId,
    type: notificationData.type || "other",
  });
  await notification.save();

  return toNotificationDTO(notification);
}

export async function getNotificationById(id: string) {
  await connectDB();

  const notification = await Notification.findById(id).populate("userId", "name email");
  if (!notification) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toNotificationDTO(notification);
}

export async function updateNotification(id: string, notificationData: UpdateNotificationInput) {
  await connectDB();

  const notification = await Notification.findByIdAndUpdate(id, notificationData, {
    new: true,
    runValidators: true,
  });
  if (!notification) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toNotificationDTO(notification);
}

export async function deleteNotification(id: string) {
  await connectDB();

  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toNotificationDTO(notification);
}
