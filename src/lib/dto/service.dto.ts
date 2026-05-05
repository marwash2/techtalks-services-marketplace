import { Types } from "mongoose";

interface PopulatedProvider {
  _id: Types.ObjectId;
  businessName: string;
  location: string;
  userId?: Types.ObjectId;
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

  availability?: string;
  location?: string;

  image?: string | null;

  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

function isPopulatedProvider(
  value: Types.ObjectId | PopulatedProvider,
): value is PopulatedProvider {
  return !!value && typeof value === "object" && "businessName" in value;
}

function isPopulatedCategory(
  value: Types.ObjectId | PopulatedCategory,
): value is PopulatedCategory {
  return !!value && typeof value === "object" && "name" in value;
}

export function toServiceDTO(service: ServiceDocument) {
  return {
    id: service._id.toString(),
    providerId: isPopulatedProvider(service.providerId)
      ? {
          _id: service.providerId._id.toString(),
          businessName: service.providerId.businessName,
          location: service.providerId.location,
        }
      : service.providerId.toString(),
    categoryId: isPopulatedCategory(service.categoryId)
      ? {
          _id: service.categoryId._id.toString(),
          name: service.categoryId.name,
        }
      : service.categoryId.toString(),
    title: service.title,

    description: service.description || "",

    price: service.price,

    duration: service.duration,

    /* NEW REQUIRED FIELDS */
    availability: service.availability || "",

    location: service.location || "",

    image: service.image || null,

    isActive: service.isActive ?? true,

    createdAt: service.createdAt || null,

    updatedAt: service.updatedAt || null,

    // /* PROVIDER */
    // providerId:
    //   isPopulatedProvider(
    //     service.providerId,
    //   )
    //     ? {
    //         _id:
    //           service.providerId._id.toString(),

    //         businessName:
    //           service.providerId
    //             .businessName,

    //         location:
    //           service.providerId
    //             .location,
    //       }
    //     : service.providerId.toString(),

    // /* CATEGORY */
    // categoryId:
    //   isPopulatedCategory(
    //     service.categoryId,
    //   )
    //     ? {
    //         _id:
    //           service.categoryId._id.toString(),

    //         name:
    //           service.categoryId
    //             .name,
    //       }
    //     : service.categoryId.toString(),

    /* PROVIDER POPULATED */
    provider: isPopulatedProvider(service.providerId)
      ? {
          _id: service.providerId._id.toString(),

          businessName: service.providerId.businessName,

          location: service.providerId.location,
        }
      : null,

    /* CATEGORY POPULATED */
    category: isPopulatedCategory(service.categoryId)
      ? {
          _id: service.categoryId._id.toString(),

          name: service.categoryId.name,
        }
      : null,
  };
}

export function toServiceListDTO(services: ServiceDocument[]) {
  return services.map(toServiceDTO);
}
