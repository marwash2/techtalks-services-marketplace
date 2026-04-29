import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  MESSAGES,
  PAGINATION,
} from "@/constants/config";

import * as serviceService from "@/services/service.service";

import { createServiceSchema } from "@/lib/validations/service.validation";

import { requireAuth } from "@/lib/auth-utils";

/* =========================================================
  *   TYPES
  * ========================================================= */
export const GET = withApiHandler(
  async (req) => {
    const { searchParams } =
      new URL(req.url);

    /* ---------------- PAGINATION ---------------- */
    const page = parseInt(
      searchParams.get("page") ||
        "1"
    );

    const limit = parseInt(
      searchParams.get("limit") ||
        String(
          PAGINATION.DEFAULT_LIMIT
        )
    );

    /* ---------------- DASHBOARD MODE ----------------
       If dashboard=true:
       Show ONLY logged-in provider services
    */
    const dashboardOnly =
      searchParams.get(
        "dashboard"
      ) === "true";

    const filters: any = {};

    if (dashboardOnly) {
      const session =
        await requireAuth(req, [
          "provider",
          "admin",
        ]);

      /*
        IMPORTANT:
        session.user.id = USER ID
        service layer converts USER ID
        -> Provider._id
      */
      filters.providerId =
        session.user.id;
    } else {
      /*
        Optional public providerId filter
      */
      const providerId =
        searchParams.get(
          "providerId"
        ) || undefined;

      if (providerId) {
        filters.providerId =
          providerId;
      }
    }

    /* ---------------- OTHER FILTERS ---------------- */
    const category =
      searchParams.get(
        "category"
      ) || undefined;

    const location =
      searchParams.get(
        "location"
      ) || undefined;

    const search =
      searchParams.get(
        "search"
      ) || undefined;

    const maxPrice =
      searchParams.get(
        "maxPrice"
      );

    if (category)
      filters.category =
        category;

    if (location)
      filters.location =
        location;

    if (search)
      filters.search =
        search;

    if (maxPrice)
      filters.price =
        Number(maxPrice);

    /* ---------------- FETCH SERVICES ---------------- */
    const result =
      await serviceService.getAllServices(
        page,
        limit,
        filters
      );

    return Response.json(
      successResponse(result)
    );
  }
);

/* =========================================================
   CREATE SERVICE
   - Provider/Admin only
   - Session gives USER ID
   - Service layer converts USER ID
     -> Provider._id
   ========================================================= */
export const POST = withApiHandler(
  async (req) => {
    try {
      const session =
        await requireAuth(req, [
          "provider",
          "admin",
        ]);

      console.log(
        "SESSION USER:",
        session.user
      );

      const body =
        await req.json();

      console.log(
        "REQUEST BODY:",
        body
      );

      const validated =
        createServiceSchema.parse(
          {
            ...body,
            providerId:
              session.user.id,
          }
        );

      console.log(
        "VALIDATED:",
        validated
      );

      const service =
        await serviceService.createService(
          validated
        );

      return Response.json(
        successResponse(
          service,
          MESSAGES.SUCCESS.CREATE
        ),
        {
          status: 201,
        }
      );
    } catch (error) {
      console.error(
        "CREATE SERVICE ERROR:",
        error
      );

      throw error;
    }
  }
);