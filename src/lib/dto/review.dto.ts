import { Types } from "mongoose";

interface ReviewDocument {
  _id: Types.ObjectId;
  userId: any;
  providerId: any;
  serviceId: any;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

export function toReviewDTO(review: ReviewDocument) {
  return {
    id: review._id.toString(),
    userId: review.userId,
    providerId: review.providerId,
    serviceId: review.serviceId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export function toReviewListDTO(reviews: ReviewDocument[]) {
  return reviews.map(toReviewDTO);
}