import { Types } from "mongoose";

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface ProviderDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId | PopulatedUser | null | undefined;
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  isVerified?: boolean;
  totalReviews?: number;
  avatar?: string | null;
  createdAt?: Date;
}

function isPopulatedUser(value: unknown): value is PopulatedUser {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function toProviderDTO(provider: ProviderDocument) {
  const normalizedUserId = isPopulatedUser(provider.userId)
    ? {
        _id: provider.userId._id.toString(),
        name: provider.userId.name,
        email: provider.userId.email,
      }
    : provider.userId
      ? provider.userId.toString()
      : "";

  return {
    id: provider._id.toString(),
    userId: isPopulatedUser(provider.userId)
      ? {
          id: provider.userId._id.toString(),
          name: provider.userId.name,
          email: provider.userId.email,
        }
      : provider.userId != null ? provider.userId.toString() : null,
    businessName: provider.businessName,
    description: provider.description,
    location: provider.location,
    rating: provider.rating,
    isVerified: provider.isVerified,
    providerStatus: (provider as any).providerStatus ?? "pending",
    totalReviews: provider.totalReviews,
    avatar: provider.avatar ?? null,
    createdAt: provider.createdAt,
  };
}

export function toProviderListDTO(providers: ProviderDocument[]) {
  return providers.map(toProviderDTO);
}