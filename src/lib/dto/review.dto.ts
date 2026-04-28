import { Types } from "mongoose";

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveId(value: any): string {
  if (!value) return "";
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
}

function resolveUser(value: any): { id: string; name?: string; email?: string } | string {
  if (!value) return "";
  if (value instanceof Types.ObjectId || typeof value === "string") {
    return value.toString();
  }
  // Populated document
  return {
    id: value._id?.toString() ?? "",
    name: value.name,
    email: value.email,
  };
}

function resolveRef(
  value: any,
  labelKey: string
): { id: string; [key: string]: string } | string {
  if (!value) return "";
  if (value instanceof Types.ObjectId || typeof value === "string") {
    return value.toString();
  }
  return {
    id: value._id?.toString() ?? "",
    [labelKey]: value[labelKey] ?? "",
  };
}

// ── Public DTO type ────────────────────────────────────────────────────────────

export interface ReviewDTO {
  id: string;
  userId: { id: string; name?: string; email?: string } | string;
  providerId: { id: string; businessName?: string } | string;
  serviceId: { id: string; title?: string } | string;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

// ── Converters ─────────────────────────────────────────────────────────────────

export function toReviewDTO(review: any): ReviewDTO {
  return {
    id: resolveId(review._id),
    userId: resolveUser(review.userId),
    providerId: resolveRef(review.providerId, "businessName"),
    serviceId: resolveRef(review.serviceId, "title"),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export function toReviewListDTO(reviews: any[]): ReviewDTO[] {
  return reviews.map(toReviewDTO);
}