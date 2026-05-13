import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import { User } from "@/models/User.model";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { ApiError } from "@/lib/api-error";
import { toProviderDTO, toProviderListDTO } from "@/lib/dto/provider.dto";
import { createNotification } from "@/services/notification.service";

type CreateProviderInput = {
  userId: string;
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  isVerified?: boolean;
  providerStatus?: "pending" | "approved" | "rejected";
  totalReviews?: number;
  avatar?: string | null;
};

type UpdateProviderInput = Partial<CreateProviderInput>;

function resolveProviderUserId(userId: unknown): string {
  if (!userId) return "";
  if (typeof userId === "string") return userId;
  if (typeof userId === "object" && userId !== null && "_id" in userId) {
    const raw = (userId as { _id?: unknown })._id;
    return raw ? String(raw) : "";
  }
  return "";
}

async function notifyProviderOnUpdate(
  previousProvider: {
    userId: unknown;
    businessName?: string;
    isVerified?: boolean;
    providerStatus?: "pending" | "approved" | "rejected";
  },
  updatedProvider: {
    isVerified?: boolean;
    providerStatus?: "pending" | "approved" | "rejected";
  }
) {
  const providerUserId = resolveProviderUserId(previousProvider.userId);
  if (!providerUserId) return;

  const businessName = previousProvider.businessName || "your provider account";
  const prevStatus = previousProvider.providerStatus ?? "pending";
  const nextStatus = updatedProvider.providerStatus ?? prevStatus;
  const prevVerified = Boolean(previousProvider.isVerified);
  const nextVerified = Boolean(updatedProvider.isVerified);

  if (nextStatus === "rejected" && prevStatus !== "rejected") {
    await createNotification({
      userId: providerUserId,
      title: "Provider Application Rejected",
      message: `Your provider application for "${businessName}" was rejected by admin.`,
      type: "provider_approval_rejected",
      link: "/provider/dashboard",
    });
    return;
  }

  if (nextStatus === "approved" && prevStatus !== "approved") {
    await createNotification({
      userId: providerUserId,
      title: "Welcome to Khidmati Providers",
      message: `Congratulations. Your application for "${businessName}" has been approved. You can now access your provider dashboard and start offering services.`,
      type: "provider_approval_approved",
      link: "/provider/dashboard",
    });
    return;
  }

  if (!prevVerified && nextVerified) {
    await createNotification({
      userId: providerUserId,
      title: "Provider Verified",
      message: `Your provider profile "${businessName}" has been verified by admin.`,
      type: "provider_verified",
      link: "/provider/dashboard",
    });
    return;
  }

  if (prevVerified && !nextVerified) {
    await createNotification({
      userId: providerUserId,
      title: "Provider Unverified",
      message: `Verification was removed from your provider profile "${businessName}".`,
      type: "provider_unverified",
      link: "/provider/dashboard",
    });
  }
}

export async function getAllProviders(
  page = 1,
  limit = PAGINATION.DEFAULT_LIMIT,
) {
  await connectDB();

  const skip = (page - 1) * limit;

  // ✅ Added "_id" so userId._id is returned and can be matched to session
  const providers = await Provider.find()
    .populate("userId", "name email _id")
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

  if (user.role === "admin") {
    throw new ApiError("Admin accounts cannot be converted to provider", 400);
  }

  if (user.role !== "provider") {
    user.role = "provider";
    await user.save();
  }

  const existingProvider = await Provider.findOne({ userId });
  if (existingProvider) {
    const existingStatus =
      (
        existingProvider as {
          providerStatus?: "pending" | "approved" | "rejected";
        }
      ).providerStatus ?? "pending";

    if (existingStatus !== "rejected") {
      throw new ApiError("User already has a provider account", 409);
    }

    existingProvider.businessName = providerData.businessName;
    existingProvider.location = providerData.location;
    existingProvider.description = providerData.description;
    existingProvider.avatar = providerData.avatar ?? null;
    existingProvider.providerStatus = "pending";
    existingProvider.isVerified = false;
    await existingProvider.save();

    try {
      await createNotification({
        userId,
        title: "Provider Application Submitted",
        message:
          "Your provider profile has been submitted and is now under admin review. You will be notified once a decision is made.",
        type: "provider_application_submitted",
        link: "/provider/dashboard",
      });
    } catch (notificationError) {
      console.error(
        "[createProvider] notification error (re-apply):",
        notificationError
      );
    }

    return toProviderDTO(existingProvider);
  }

  const provider = new Provider(providerData);
  await provider.save();

  try {
    await createNotification({
      userId,
      title: "Provider Application Submitted",
      message:
        "Your provider profile has been submitted and is now under admin review. You will be notified once a decision is made.",
      type: "provider_application_submitted",
      link: "/provider/dashboard",
    });
  } catch (notificationError) {
    console.error("[createProvider] notification error:", notificationError);
  }

  return toProviderDTO(provider);
}

export async function getProviderById(id: string) {
  await connectDB();

  // ✅ Added "_id" so userId._id is returned on provider detail pages
  const provider = await Provider.findById(id).populate(
    "userId",
    "name email _id"
  );
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  return toProviderDTO(provider);
}

export async function updateProvider(
  id: string,
  providerData: UpdateProviderInput,
) {
  await connectDB();

  const existingProvider = await Provider.findById(id);
  if (!existingProvider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  const provider = await Provider.findByIdAndUpdate(id, providerData, {
    new: true,
    runValidators: true,
  });
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  try {
    await notifyProviderOnUpdate(existingProvider, provider);
  } catch (notificationError) {
    console.error(
      `[updateProvider] notification error for provider ${id}:`,
      notificationError
    );
  }

  return toProviderDTO(provider);
}

export async function deleteProvider(id: string) {
  await connectDB();

  const existingProvider = await Provider.findById(id);
  if (!existingProvider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  const provider = await Provider.findByIdAndDelete(id);
  if (!provider) throw new ApiError(MESSAGES.ERROR.NOT_FOUND, 404);

  try {
    const providerUserId = resolveProviderUserId(existingProvider.userId);
    if (providerUserId) {
      await createNotification({
        userId: providerUserId,
        title: "Provider Account Removed",
        message: `Your provider profile "${existingProvider.businessName}" was deleted by admin.`,
        type: "provider_deleted",
        link: "/provider/dashboard",
      });
    }
  } catch (notificationError) {
    console.error(
      `[deleteProvider] notification error for provider ${id}:`,
      notificationError
    );
  }

  return toProviderDTO(provider);
}