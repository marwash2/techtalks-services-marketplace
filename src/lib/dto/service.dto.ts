import { Types } from "mongoose";

interface PopulatedProvider {
  _id: Types.ObjectId;
  businessName: string;
  location: string;
}

interface PopulatedCategory {
  _id: Types.ObjectId;
  name: string;
}

interface ServiceDocument {
  _id: Types.ObjectId;
  providerId: Types.ObjectId | PopulatedProvider;
  categoryId: Types.ObjectId | PopulatedCategory;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  isActive?: boolean;
  createdAt?: Date;
}

function isPopulatedProvider(
  value: Types.ObjectId | PopulatedProvider,
): value is PopulatedProvider {
  return value && typeof value === "object" && "businessName" in value;
}

function isPopulatedCategory(
  value: Types.ObjectId | PopulatedCategory,
): value is PopulatedCategory {
  return value && typeof value === "object" && "name" in value;
}

export function toServiceDTO(service: ServiceDocument) {
  return {
    id: service._id.toString(),
    providerId: isPopulatedProvider(service.providerId)
      ? {
          id: service.providerId._id.toString(),
          businessName: service.providerId.businessName,
          location: service.providerId.location,
        }
      : service.providerId, // fallback if not populated
    categoryId: isPopulatedCategory(service.categoryId)
      ? {
          id: service.categoryId._id.toString(),
          name: service.categoryId.name,
        }
      : service.categoryId, // fallback if not populated
    title: service.title,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image: service.image || null,

    // FIX PROVIDER
    provider: isPopulatedProvider(service.providerId)
      ? {
          _id: service.providerId._id.toString(),
          businessName: service.providerId.businessName,
          location: service.providerId.location,
        }
      : null,

    // FIX CATEGORY
    category: isPopulatedCategory(service.categoryId)
      ? {
          name: service.categoryId.name,
        }
      : null,
  };
}

export function toServiceListDTO(services: ServiceDocument[]) {
  return services.map(toServiceDTO);
}
