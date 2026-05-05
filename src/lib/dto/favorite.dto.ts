import { Types } from "mongoose";

export interface FavoriteDTO {
  id: string;
  userId: string;
  service: ServiceRef | string;
  createdAt?: Date;
}

interface ServiceRef {
  id: string;
  title: string;
  price?: number;
  averageRating?: number;
  reviewCount?: number;
  image?: string | null;
}

function resolveService(value: any): ServiceRef | string {
  if (!value) return "";
  if (value instanceof Types.ObjectId || typeof value === "string") {
    return value.toString();
  }
  return {
    id:            value._id?.toString() ?? "",
    title:         value.title           ?? "",
    price:         value.price,
    averageRating: value.averageRating,
    reviewCount:   value.reviewCount,
    image:         value.image,
  };
}

export function toFavoriteDTO(favorite: any): FavoriteDTO {
  return {
    id:        favorite._id.toString(),
    userId:    favorite.userId?.toString?.() ?? favorite.userId,
    service:   resolveService(favorite.serviceId),
    createdAt: favorite.createdAt,
  };
}

export function toFavoriteListDTO(favorites: any[]): FavoriteDTO[] {
  return favorites.map(toFavoriteDTO);
}