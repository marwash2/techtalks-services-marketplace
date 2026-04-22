import { Types } from "mongoose";

interface ServiceDocument {
  _id: Types.ObjectId;
  providerId: any;
  categoryId: any;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  isActive?: boolean;
  createdAt?: Date;
}

export function toServiceDTO(service: any) {
  return {
    _id: service._id.toString(),
    title: service.title,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image: service.image || null,

    // FIX PROVIDER
    provider: service.providerId
      ? {
          _id: service.providerId._id?.toString(),
          businessName: service.providerId.businessName,
          location: service.providerId.location,
        }
      : null,

    // FIX CATEGORY
    category: service.categoryId
      ? {
          name: service.categoryId.name,
        }
      : null,
  };
}

export function toServiceListDTO(services: any[]) {
  return services.map(toServiceDTO);
}