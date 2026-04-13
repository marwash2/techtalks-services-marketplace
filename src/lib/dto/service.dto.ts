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

export function toServiceDTO(service: ServiceDocument) {
  return {
    id: service._id.toString(),
    providerId: service.providerId,
    categoryId: service.categoryId,
    title: service.title,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image: service.image,
    isActive: service.isActive,
    createdAt: service.createdAt,
  };
}

export function toServiceListDTO(services: ServiceDocument[]) {
  return services.map(toServiceDTO);
}