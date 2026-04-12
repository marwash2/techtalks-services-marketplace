import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as notificationService from "@/services/notification.service";
import { createNotificationSchema } from "@/lib/validations/notification.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));
  const userId = searchParams.get("userId") || undefined;
  const isReadParam = searchParams.get("isRead");
  const isRead = isReadParam !== null ? isReadParam === "true" : undefined;

  const result = await notificationService.getAllNotifications(page, limit, { userId, isRead });
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createNotificationSchema.parse(body);
  const notification = await notificationService.createNotification(validated);
  return Response.json(successResponse(notification, MESSAGES.SUCCESS.CREATE), { status: 201 });
});