import { connectDB } from "@/lib/db";
import { Provider } from "@/lib/schemas/Provider.schema";
import { PAGINATION, MESSAGES } from "@/constants/config";

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

// Get all providers with pagination
export async function getAllProviders(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT
) {
  await connectDB();

  const skip = (page - 1) * limit;
  const providers = await Provider.find()
    .populate("userId", "name email")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Provider.countDocuments();

  return {
    providers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Create new provider
export async function createProvider(providerData: CreateProviderInput) {
  await connectDB();

  const provider = new Provider(providerData);
  await provider.save();

  return provider;
}

// Get provider by ID
export async function getProviderById(id: string) {
  await connectDB();

  const provider = await Provider.findById(id).populate("userId");
  if (!provider) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return provider;
}

// Update provider
export async function updateProvider(
  id: string,
  providerData: UpdateProviderInput
) {
  await connectDB();

  const provider = await Provider.findByIdAndUpdate(id, providerData, {
    new: true,
    runValidators: true,
  });

  if (!provider) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return provider;
}

// Delete provider
export async function deleteProvider(id: string) {
  await connectDB();

  const provider = await Provider.findByIdAndDelete(id);
  if (!provider) {
    throw new Error(MESSAGES.ERROR.NOT_FOUND);
  }

  return provider;
}
