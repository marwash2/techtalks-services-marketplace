import { Types } from "mongoose";

interface PopulatedProvider {
  _id: Types.ObjectId;
  businessName: string;
  location: string;
  userId?: Types.ObjectId;
  avatar?: string | null;
  isVerified?: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt?: Date;
}

interface PopulatedCategory {
  _id: Types.ObjectId;
  name: string;
}

interface ServiceDocument {
  _id: Types.ObjectId;

  providerId: Types.ObjectId | PopulatedProvider | null | undefined;

  categoryId: Types.ObjectId | PopulatedCategory | null | undefined;

  title: string;
  description?: string;

  price: number;
  duration: number;

  availability?: string;
  location?: string;

  image?: string | null;

  isActive?: boolean;
  averageRating?: number;
  reviewCount?: number;
  favoritesCount?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

function isPopulatedProvider(
  value: Types.ObjectId | PopulatedProvider | null | undefined,
): value is PopulatedProvider {
  return !!value && typeof value === "object" && "businessName" in value;
}

function isPopulatedCategory(
  value: Types.ObjectId | PopulatedCategory | null | undefined,
): value is PopulatedCategory {
  return !!value && typeof value === "object" && "name" in value;
}

function toIdString(value: Types.ObjectId | null | undefined) {
  return value ? value.toString() : null;
}

export function toServiceDTO(service: ServiceDocument) {
  const providerId = service.providerId;
  const categoryId = service.categoryId;

  return {
    id: service._id.toString(),
    providerId: isPopulatedProvider(providerId)
      ? {
          _id: providerId._id.toString(),
          businessName: providerId.businessName,
          location: providerId.location,
          avatar: providerId.avatar ?? null,
          isVerified: providerId.isVerified ?? false,
          rating: providerId.rating ?? 0,
          totalReviews: providerId.totalReviews ?? 0,
          joinedAt: providerId.createdAt ?? null,
        }
      : toIdString(providerId as Types.ObjectId | null | undefined),
    categoryId: isPopulatedCategory(categoryId)
      ? {
          _id: categoryId._id.toString(),
          name: categoryId.name,
        }
      : toIdString(categoryId as Types.ObjectId | null | undefined),
    title: service.title,

    description: service.description || "",

    price: service.price,

    duration: service.duration,

    /* NEW REQUIRED FIELDS */
    availability: service.availability || "",

    location: service.location || "",

    image: service.image || null,

    isActive: service.isActive ?? true,

    averageRating: service.averageRating ?? 0,

    reviewCount: service.reviewCount ?? 0,

    favoritesCount: service.favoritesCount ?? 0,

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
    provider: isPopulatedProvider(providerId)
      ? {
          _id: providerId._id.toString(),

          businessName: providerId.businessName,

          location: providerId.location,

          avatar: providerId.avatar ?? null,

          isVerified: providerId.isVerified ?? false,

          rating: providerId.rating ?? 0,

          totalReviews: providerId.totalReviews ?? 0,

          joinedAt: providerId.createdAt ?? null,
        }
      : null,

    /* CATEGORY POPULATED */
    category: isPopulatedCategory(categoryId)
      ? {
          _id: categoryId._id.toString(),

          name: categoryId.name,
        }
      : null,
  };
}

export function toServiceListDTO(services: ServiceDocument[]) {
  return services.map(toServiceDTO);
}
