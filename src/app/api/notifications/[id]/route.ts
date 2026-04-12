import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as notificationService from "@/services/notification.service";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const notification = await notificationService.getNotificationById(id);
  return Response.json(successResponse(notification));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const notification = await notificationService.updateNotification(id, body);
  return Response.json(successResponse(notification, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await notificationService.deleteNotification(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});