import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/schemas/Notification.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toNotificationDTO, toNotificationListDTO } from "@/lib/dto/notification.dto";

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

  const notification = new Notification({
    ...notificationData,
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