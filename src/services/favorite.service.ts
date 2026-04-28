import { connectDB } from "@/lib/db";
import { Favorite } from "@/models/Favorite.model";
import { Service }  from "@/models/Service.model";
import { ApiError }  from "@/lib/api-error";
import { toFavoriteDTO, toFavoriteListDTO } from "@/lib/dto/favorite.dto";
import { MESSAGES, PAGINATION } from "@/constants/config";

// ── Stat sync ──────────────────────────────────────────────────────────────────

async function syncFavoritesCount(serviceId: string): Promise<void> {
  const count = await Favorite.countDocuments({ serviceId });
  await Service.findByIdAndUpdate(serviceId, { favoritesCount: count });
}

// ── Service functions ──────────────────────────────────────────────────────────

/**
 * GET /api/favorites
 * Returns all services favorited by the current user, with service data populated.
 */
export async function getUserFavorites(
  userId: string,
  page  = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT
) {
  await connectDB();

  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    Favorite.find({ userId })
      .populate("serviceId", "title price image averageRating reviewCount isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Favorite.countDocuments({ userId }),
  ]);

  return {
    favorites: toFavoriteListDTO(favorites),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

/**
 * GET /api/favorites/[serviceId]
 * Returns whether the current user has favorited a given service.
 */
export async function isFavorited(
  userId:    string,
  serviceId: string
): Promise<{ favorited: boolean }> {
  await connectDB();

  const exists = await Favorite.exists({ userId, serviceId });
  return { favorited: exists !== null };
}

/**
 * POST /api/favorites
 * Adds a service to the user's favorites. Idempotent — returns 409 on duplicate.
 */
export async function addFavorite(userId: string, serviceId: string) {
  await connectDB();

  const serviceExists = await Service.exists({ _id: serviceId });
  if (!serviceExists) throw new ApiError("Service not found", 404);

  try {
    const favorite = await Favorite.create({ userId, serviceId });
    await syncFavoritesCount(serviceId);

    const populated = await Favorite.findById(favorite._id)
      .populate("serviceId", "title price image averageRating reviewCount")
      .lean()
      .exec();

    return toFavoriteDTO(populated);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ApiError("Service is already in your favorites", 409);
    }
    throw err;
  }
}

/**
 * DELETE /api/favorites/[serviceId]
 * Removes a service from the user's favorites.
 */
export async function removeFavorite(
  userId:    string,
  serviceId: string
): Promise<{ serviceId: string }> {
  await connectDB();

  const deleted = await Favorite.findOneAndDelete({ userId, serviceId });
  if (!deleted) throw new ApiError("Favorite not found", 404);

  await syncFavoritesCount(serviceId);
  return { serviceId };
}