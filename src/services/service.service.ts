import { connectDB } from "@/lib/db";
import { Service } from "@/lib/schemas/Service.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";

type ServiceFilters = {
  providerId?: string;
  categoryId?: string;
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

// Get all services with pagination and filters
export async function getAllServices(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
  filters: ServiceFilters = {},
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: ServiceFilters = {};

  if (filters.providerId) query.providerId = filters.providerId;
  if (filters.categoryId) query.categoryId = filters.categoryId;

  const services = await Service.find(query)
    .populate("providerId", "businessName location")
    .populate("categoryId", "name")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Service.countDocuments(query);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Create new service
export async function createService(serviceData: CreateServiceInput) {
  await connectDB();

  const service = new Service(serviceData);
  await service.save();

  return service;
}

// Get service by ID
export async function getServiceById(id: string) {
  await connectDB();

  const service = await Service.findById(id).populate("providerId categoryId");
  if (!service) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return service;
}

// Update service
export async function updateService(
  id: string,
  serviceData: UpdateServiceInput,
) {
  await connectDB();

  const service = await Service.findByIdAndUpdate(id, serviceData, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return service;
}

// Delete service
export async function deleteService(id: string) {
  await connectDB();

  const service = await Service.findByIdAndDelete(id);
  if (!service) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return service;
}
