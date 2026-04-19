import { connectDB } from "@/lib/db";
import { Service } from "@/lib/schemas/Service.schema";
import { Provider } from "@/lib/schemas/Provider.schema";
import { Category } from "@/lib/schemas/Category.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toServiceDTO, toServiceListDTO } from "@/lib/dto/service.dto";

type ServiceFilters = {
 providerId?: string;
  categoryId?: string;
  search?: string;
  price?: number;
  location?: string;
  category?: string; 
};

type CreateServiceInput = {
  providerId: string;
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  isActive?: boolean;
};

type UpdateServiceInput = Partial<CreateServiceInput>;

export async function getAllServices(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: ServiceFilters = {}
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: any = {};

  if (filters.providerId) query.providerId = filters.providerId;
  if (filters.categoryId) query.categoryId = filters.categoryId;

  // 🔍 search (title)
  if (filters.search) {
    query.title = { $regex: filters.search, $options: "i" };
  }

  // 💰 max price
  if (filters.price) {
    query.price = { $lte: filters.price };
  }

  let services = await Service.find(query)
    .populate("providerId", "businessName location")
    .populate("categoryId", "name")
    .skip(skip)
    .limit(limit)
    .exec();

  // 🏷️ filter by category name
  if (filters.category) {
    services = services.filter(
      (s: any) =>
        typeof s.categoryId === "object" &&
        s.categoryId?.name?.toLowerCase() ===
          filters.category?.toLowerCase()
    );
  }

  // 📍 filter by provider location
  if (filters.location) {
    services = services.filter(
      (s: any) =>
        typeof s.providerId === "object" &&
        s.providerId?.location?.toLowerCase() ===
          filters.location?.toLowerCase()
    );
  }

  const total = services.length;

  return {
    services: toServiceListDTO(services),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function createService(serviceData: CreateServiceInput) {
  await connectDB();

  const { providerId, categoryId, title, price, duration } = serviceData;

  if (!providerId || !categoryId || !title || !price || !duration) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  const provider = await Provider.findById(providerId);
  if (!provider) throw new ApiError("Provider not found", 404);

  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError("Category not found", 404);

  const service = new Service(serviceData);
  await service.save();

  return toServiceDTO(service);
}

export async function getServiceById(id: string) {
  await connectDB();

  const service = await Service.findById(id).populate("providerId categoryId");
  if (!service) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toServiceDTO(service);
}

export async function updateService(id: string, serviceData: UpdateServiceInput) {
  await connectDB();

  const service = await Service.findByIdAndUpdate(id, serviceData, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toServiceDTO(service);
}

export async function deleteService(id: string) {
  await connectDB();

  const service = await Service.findByIdAndDelete(id);
  if (!service) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toServiceDTO(service);
}