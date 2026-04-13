import { Types } from "mongoose";

interface ProviderDocument {
  _id: Types.ObjectId;
  userId: any;
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  isVerified?: boolean;
  totalReviews?: number;
  avatar?: string | null;
  createdAt?: Date;
}

export function toProviderDTO(provider: ProviderDocument) {
  return {
    id: provider._id.toString(),
    userId: provider.userId,
    businessName: provider.businessName,
    description: provider.description,
    location: provider.location,
    rating: provider.rating,
    isVerified: provider.isVerified,
    totalReviews: provider.totalReviews,
    avatar: provider.avatar,
    createdAt: provider.createdAt,
  };
}

export function toProviderListDTO(providers: ProviderDocument[]) {
  return providers.map(toProviderDTO);
}