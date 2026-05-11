import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  MESSAGES,
  PAGINATION,
} from "@/constants/config";

import * as serviceService from "@/services/service.service";

import { createServiceSchema } from "@/lib/validations/service.validation";

import { requireAuth } from "@/lib/auth-utils";
import { createNotification } from "@/services/notification.service";
import { assertCategoryExists } from "@/services/category.service";
import { Category } from "@/models/Category.model";
import { Location } from "@/models/Location.model";  // ← NEW

export const GET = withApiHandler(

  async (req) => {
    console.log("🔥 API /services HIT");
    const { searchParams } =
      new URL(req.url);

    /* ---------------- PAGINATION ---------------- */
    const page = parseInt(
      searchParams.get("page") || "1"
    );

    const limit = parseInt(
      searchParams.get("limit") ||
        String(PAGINATION.DEFAULT_LIMIT)
    );

    /* ---------------- DASHBOARD MODE ---------------- */
    const dashboardOnly =
      searchParams.get("dashboard") === "true";

    const filters: any = {};

    if (dashboardOnly) {
      const session = await requireAuth(req, ["provider", "admin"]);
      filters.providerId = session.user.id;
    } else {
      const providerId =
        searchParams.get("providerId") || undefined;
      if (providerId) filters.providerId = providerId;
    }

    /* ---------------- CATEGORY FILTER ---------------- */
    const categoryParam =
      searchParams.get("category") || undefined;

    if (categoryParam) {
      const categoryDoc = await Category.findOne({ slug: categoryParam })
        .select("_id")
        .lean();

      if (categoryDoc) {
        filters.categoryId = categoryDoc._id.toString();
      } else {
        return Response.json(
          successResponse({
            services: [],
            pagination: { page, limit, total: 0, pages: 0 },
          })
        );
      }
    }

    /* ---------------- LOCATION FILTER (FIXED) ----------------
       Old code: filters.location = "zahle"
       ❌ Service model no longer has a location string field.
       New code: resolve location name → locationId (ObjectId).
    */
    const locationParam =
      searchParams.get("location") || undefined;

    if (locationParam) {
      const locationDoc = await Location.findOne({
        name:     { $regex: new RegExp(`^${locationParam}$`, "i") },
        isActive: true,
      })
        .select("_id")
        .lean();

      if (locationDoc) {
        filters.locationId = locationDoc._id.toString();
      } else {
        // Unknown location — return empty result
        return Response.json(
          successResponse({
            services: [],
            pagination: { page, limit, total: 0, pages: 0 },
          })
        );
      }
    }

    /* ---------------- OTHER FILTERS ---------------- */
    const search   = searchParams.get("search")   || undefined;
    const maxPrice = searchParams.get("maxPrice");

    if (search)   filters.search = search;
    if (maxPrice) filters.price  = Number(maxPrice);

    /* ---------------- FETCH SERVICES ---------------- */
    const result = await serviceService.getAllServices(
      page,
      limit,
      filters
    );

    return Response.json(successResponse(result));
  }
);

/* =========================================================
   CREATE SERVICE
   - Provider/Admin only
   - Session gives USER ID
   - Service layer converts USER ID → Provider._id
   ========================================================= */
export const POST = withApiHandler(
  async (req) => {
    try {
      const session = await requireAuth(req, ["provider", "admin"]);

      console.log("SESSION USER:", session.user);

      const body = await req.json();

      console.log("REQUEST BODY:", body);

      const validated = createServiceSchema.parse({
        ...body,
        providerId: session.user.id,
      });

      console.log("VALIDATED:", validated);

      // Validate category exists before creating service
      if (validated.categoryId) {
        await assertCategoryExists(validated.categoryId);
      }

      // Validate location exists if provided
      if (validated.locationId) {
        const locationExists = await Location.exists({
          _id:      validated.locationId,
          isActive: true,
        });
        if (!locationExists) {
          const { ApiError } = await import("@/lib/api-error");
          throw new ApiError("Location not found", 404);
        }
      }

      const service = await serviceService.createService(validated);

      try {
        await createNotification({
          userId: session.user.id,
          title: "Service Added",
          message: `You published "${service.title}" for $${service.price} (${service.duration} min). It is now visible in your services list.`,
          type: "service_added",
          link: "/provider/services",
        });
      } catch (notificationError) {
        console.error("CREATE SERVICE notification error:", notificationError);
      }

      return Response.json(
        successResponse(service, MESSAGES.SUCCESS.CREATE),
        { status: 201 }
      );
    } catch (error) {
      console.error("CREATE SERVICE ERROR:", error);
      throw error;
    }
  }
);