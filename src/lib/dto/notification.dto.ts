import { Types } from "mongoose";

interface NotificationDocument {
  _id: Types.ObjectId;
  userId: any;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt?: Date;
}

export function toNotificationDTO(notification: NotificationDocument) {
  return {
    id: notification._id.toString(),
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    link: notification.link,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}

export function toNotificationListDTO(notifications: NotificationDocument[]) {
  return notifications.map(toNotificationDTO);
}