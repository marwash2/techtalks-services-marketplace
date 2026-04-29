import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service.model";
import { Provider } from "@/models/Provider.model";
import Category from "@/models/Category.model";

import {
  MESSAGES,
  PAGINATION,
} from "@/constants/config";

import { ApiError } from "@/lib/api-error";
import { toServiceDTO } from "@/lib/dto/service.dto";

import { FilterQuery } from "mongoose";
import { IService } from "@/lib/schemas/Service.schema";

/* =========================================================
   TYPES
   ========================================================= */

type ServiceFilters = {
  providerId?: string; // Can be USER ID or PROVIDER ID
  categoryId?: string;
  search?: string;
  price?: number;
  location?: string;
  category?: string;
};

type CreateServiceInput = {
  providerId: string; // USER ID from session
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
};

type UpdateServiceInput =
  Partial<CreateServiceInput>;

type PopulatedService =
  IService & {
    providerId?: {
      _id?: string;
      location?: string;
      businessName?: string;
      userId?: string;
    };

    categoryId?: {
      _id?: string;
      name?: string;
    };
  };

/* =========================================================
   GET ALL SERVICES
   ========================================================= */

export async function getAllServices(
  page: number = 1,
  limit: number =
    PAGINATION.DEFAULT_LIMIT,
  filters: ServiceFilters = {}
) {
  await connectDB();

  const skip =
    (page - 1) * limit;

  const query:
    FilterQuery<IService> =
    {};

  /* ---------------- SEARCH ---------------- */
  if (filters.search) {
    query.title = {
      $regex: filters.search,
      $options: "i",
    };
  }

  /* ---------------- PRICE ---------------- */
  if (filters.price) {
    query.price = {
      $lte: filters.price,
    };
  }

  /* ---------------- CATEGORY ID ---------------- */
  if (filters.categoryId) {
    query.categoryId =
      filters.categoryId;
  }

  /* ---------------- PROVIDER FILTER ----------------
     Supports:
     - USER ID
     - PROVIDER ID
  */
  if (filters.providerId) {
    let provider =
      await Provider.findOne({
        userId:
          filters.providerId,
      });

    if (!provider) {
      provider =
        await Provider.findById(
          filters.providerId
        );
    }

    if (!provider) {
      return {
        services: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }

    query.providerId =
      provider._id;
  }

  /* ---------------- FETCH ---------------- */
  let services =
    await Service.find(query)
      .populate(
        "providerId",
        "location businessName userId"
      )
      .populate(
        "categoryId",
        "name"
      );

  /* ---------------- LOCATION FILTER ---------------- */
  if (filters.location) {
    services =
      services.filter((s) =>
        (
          s as PopulatedService
        ).providerId?.location
          ?.toLowerCase()
          .includes(
            filters.location!.toLowerCase()
          )
      );
  }

  /* ---------------- CATEGORY NAME FILTER ---------------- */
  if (filters.category) {
    services =
      services.filter((s) =>
        (
          s as PopulatedService
        ).categoryId?.name
          ?.toLowerCase()
          .includes(
            filters.category!.toLowerCase()
          )
      );
  }

  const total =
    services.length;

  const paginatedServices =
    services.slice(
      skip,
      skip + limit
    );

  return {
    services:
      paginatedServices.map(
        (service) =>
          toServiceDTO(
            service
          )
      ),

    pagination: {
      page,
      limit,
      total,
      pages:
        Math.ceil(
          total / limit
        ),
    },
  };
}

/* =========================================================
   CREATE SERVICE
   ========================================================= */

export async function createService(
  serviceData: CreateServiceInput
) {
  await connectDB();

  const {
    providerId, // USER ID
    categoryId,
    title,
    price,
    duration,
  } = serviceData;

  if (
    !providerId ||
    !categoryId ||
    !title ||
    !price ||
    !duration
  ) {
    throw new ApiError(
      MESSAGES.ERROR
        .INVALID_INPUT,
      400
    );
  }

  /*
    USER ID -> PROVIDER PROFILE
  */
  const provider =
    await Provider.findOne({
      userId: providerId,
    });

  if (!provider) {
    throw new ApiError(
      "Provider not found",
      404
    );
  }

  const category =
    await Category.findById(
      categoryId
    );

  if (!category) {
    throw new ApiError(
      "Category not found",
      404
    );
  }

  /*
    Save Provider._id
  */
  const service =
    new Service({
      ...serviceData,
      providerId:
        provider._id,
    });

  await service.save();

  const populatedService =
    await Service.findById(
      service._id
    )
      .populate(
        "providerId",
        "businessName location userId"
      )
      .populate(
        "categoryId",
        "name"
      );

  return toServiceDTO(
    populatedService
  );
}

/* =========================================================
   GET SINGLE SERVICE
   ========================================================= */

export async function getServiceById(
  id: string
) {
  await connectDB();

  const service =
    await Service.findById(id)
      .populate(
        "providerId",
        "businessName location userId"
      )
      .populate(
        "categoryId",
        "name"
      );

  if (!service) {
    throw new ApiError(
      MESSAGES.ERROR.NOT_FOUND,
      404
    );
  }

  return toServiceDTO(
    service
  );
}

/* =========================================================
   UPDATE SERVICE
   ========================================================= */

export async function updateService(
  id: string,
  serviceData: UpdateServiceInput,
  currentUser?: {
    id: string; // USER ID
    role: string;
  }
) {
  await connectDB();

  const existingService =
    await Service.findById(
      id
    );

  if (!existingService) {
    throw new ApiError(
      MESSAGES.ERROR.NOT_FOUND,
      404
    );
  }

  /* ---------------- OWNERSHIP ---------------- */
  if (currentUser) {
    const isAdmin =
      currentUser.role ===
      "admin";

    const provider =
      await Provider.findOne(
        {
          userId:
            currentUser.id,
        }
      );

    if (
      !provider &&
      !isAdmin
    ) {
      throw new ApiError(
        "Provider not found",
        404
      );
    }

    const isOwner =
      provider &&
      existingService.providerId.toString() ===
        provider._id.toString();

    if (
      !isAdmin &&
      !isOwner
    ) {
      throw new ApiError(
        "Unauthorized",
        403
      );
    }
  }

  /* ---------------- CATEGORY VALIDATION ---------------- */
  if (
    serviceData.categoryId
  ) {
    const category =
      await Category.findById(
        serviceData.categoryId
      );

    if (!category) {
      throw new ApiError(
        "Category not found",
        404
      );
    }
  }

  /* ---------------- SECURITY ---------------- */
  const {
    providerId,
    ...safeData
  } = serviceData;

  /* ---------------- UPDATE ---------------- */
  const updatedService =
    await Service.findByIdAndUpdate(
      id,
      safeData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "providerId",
        "businessName location userId"
      )
      .populate(
        "categoryId",
        "name"
      );

  if (!updatedService) {
    throw new ApiError(
      MESSAGES.ERROR.NOT_FOUND,
      404
    );
  }

  return toServiceDTO(
    updatedService
  );
}

/* =========================================================
   DELETE SERVICE
   ========================================================= */

export async function deleteService(
  id: string,
  currentUser?: {
    id: string;
    role: string;
  }
) {
  await connectDB();

  const existingService =
    await Service.findById(
      id
    );

  if (!existingService) {
    throw new ApiError(
      MESSAGES.ERROR.NOT_FOUND,
      404
    );
  }

  /* ---------------- OWNERSHIP ---------------- */
  if (currentUser) {
    const isAdmin =
      currentUser.role ===
      "admin";

    const provider =
      await Provider.findOne(
        {
          userId:
            currentUser.id,
        }
      );

    if (
      !provider &&
      !isAdmin
    ) {
      throw new ApiError(
        "Provider not found",
        404
      );
    }

    const isOwner =
      provider &&
      existingService.providerId.toString() ===
        provider._id.toString();

    if (
      !isAdmin &&
      !isOwner
    ) {
      throw new ApiError(
        "Unauthorized",
        403
      );
    }
  }

  await Service.findByIdAndDelete(
    id
  );

  return {
    deleted: true,
  };
}