import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import { User } from "@/models/User.model";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toProviderDTO, toProviderListDTO } from "@/lib/dto/provider.dto";

type CreateProviderInput = {
  userId: string;
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  isVerified?: boolean;
  totalReviews?: number;
  avatar?: string | null;
};

type UpdateProviderInput = Partial<CreateProviderInput>;

export async function getAllProviders(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  await connectDB();

  const skip = (page - 1) * limit;
  const providers = await Provider.find()
    .populate("userId", "name email")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Provider.countDocuments();

  return {
    providers: toProviderListDTO(providers),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createProvider(providerData: CreateProviderInput) {
  await connectDB();

  const { userId, businessName, location } = providerData;

  if (!userId || !businessName || !location) {
    throw new ApiError(MESSAGES.ERROR.INVALID_INPUT, 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const existingProvider = await Provider.findOne({ userId });
  if (existingProvider) throw new ApiError("User already has a provider account", 409);

  const provider = new Provider(providerData);
  await provider.save();

  return toProviderDTO(provider);
}

export async function getProviderById(id: string) {
  await connectDB();

  const provider = await Provider.findById(id).populate("userId", "name email");
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toProviderDTO(provider);
}

export async function updateProvider(id: string, providerData: UpdateProviderInput) {
  await connectDB();

  const provider = await Provider.findByIdAndUpdate(id, providerData, {
    new: true,
    runValidators: true,
  });
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toProviderDTO(provider);
}

export async function deleteProvider(id: string) {
  await connectDB();

  const provider = await Provider.findByIdAndDelete(id);
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toProviderDTO(provider);
}