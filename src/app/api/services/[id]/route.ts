import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as serviceService from "@/services/service.service";
import { updateServiceSchema } from "@/lib/validations/service.validation";
import { requireAuth } from "@/lib/auth-utils";

// GET SINGLE SERVICE BY ID
export const GET = withApiHandler(
  async (_req, { params }) => {
    const { id } =
      await params;

    const service =
      await serviceService.getServiceById(
        id
      );

    if (!service) {
      return Response.json(
        {
          error:
            "Service not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      successResponse({
        service,
      })
    );
  }
);

// UPDATE SERVICE
export const PUT = withApiHandler(
  async (req, { params }) => {
    const session =
      await requireAuth(req, [
        "provider",
        "admin",
      ]);

    const { id } =
      await params;

    const body =
      await req.json();

    const validated =
      updateServiceSchema.parse(
        body
      );

    const service =
      await serviceService.updateService(
        id,
        validated,
        {
          id: session.user.id,
          role:
            session.user.role ||
            "",
        }
      );

    return Response.json(
      successResponse(
        service,
        MESSAGES.SUCCESS.UPDATE
      )
    );
  }
);

// DELETE SERVICE
export const DELETE =
  withApiHandler(
    async (
      req,
      { params }
    ) => {
      const session =
        await requireAuth(req, [
          "provider",
          "admin",
        ]);

      const { id } =
        await params;

      await serviceService.deleteService(
        id,
        {
          id: session.user.id,
          role:
            session.user.role ||
            "",
        }
      );

      return Response.json(
        successResponse(
          null,
          MESSAGES.SUCCESS.DELETE
        )
      );
    }
  );