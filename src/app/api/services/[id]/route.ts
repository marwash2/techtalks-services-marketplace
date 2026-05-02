import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as serviceService from "@/services/service.service";
import { updateServiceSchema } from "@/lib/validations/service.validation";
import { requireAuth } from "@/lib/auth-utils";
import { createNotification } from "@/services/notification.service";
import Category from "@/models/Category.model";

function describeChanges(
  beforeService: Record<string, unknown>,
  payload: Record<string, unknown>,
  categoryLabel?: string
) {
  const changes: string[] = [];

  const addChange = (label: string, beforeValue: unknown, afterValue: unknown) => {
    if (afterValue === undefined) return;
    if (String(beforeValue ?? "") === String(afterValue ?? "")) return;
    changes.push(`${label}: "${String(beforeValue ?? "-")}" -> "${String(afterValue ?? "-")}"`);
  };

  addChange("Title", beforeService.title, payload.title);
  addChange("Description", beforeService.description, payload.description);
  addChange("Price", beforeService.price, payload.price);
  addChange("Duration", beforeService.duration, payload.duration);
  addChange("Image", beforeService.image, payload.image);
  if (payload.categoryId !== undefined) {
    const beforeCategory =
      (beforeService.category as { name?: string } | undefined)?.name ||
      String(beforeService.categoryId ?? "-");
    const afterCategory = categoryLabel || String(payload.categoryId ?? "-");
    if (beforeCategory !== afterCategory) {
      changes.push(`Category: "${beforeCategory}" → "${afterCategory}"`);
    }
  }

  return changes;
}

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

    const before = await serviceService.getServiceById(id);

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

    let categoryLabel: string | undefined;
    if (validated.categoryId) {
      const categoryDoc = await Category.findById(validated.categoryId).select("name").lean();
      categoryLabel = (categoryDoc as { name?: string } | null)?.name;
    }

    const changes = describeChanges(
      before as Record<string, unknown>,
      validated as Record<string, unknown>,
      categoryLabel
    );
    const details =
      changes.length > 0
        ? changes.join(" | ")
        : "No field-level changes were detected.";

    try {
      await createNotification({
        userId: session.user.id,
        title: "Service Updated",
        message: `Your service "${(before as { title?: string }).title || "Untitled Service"}" was updated successfully. ${details}`,
        type: "other",
        link: `/provider/services/edit_page/${id}`,
      });
    } catch (notificationError) {
      console.error("[PUT /api/services/[id]] notification error:", notificationError);
    }

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

      const existing =
        await serviceService.getServiceById(
          id
        );

      await serviceService.deleteService(
        id,
        {
          id: session.user.id,
          role:
            session.user.role ||
            "",
        }
      );

      try {
        await createNotification({
          userId: session.user.id,
          title: "Service Deleted",
          message: `You deleted "${(existing as { title?: string }).title || "a service"}" (Price: $${String((existing as { price?: number }).price ?? "-")}, Duration: ${String((existing as { duration?: number }).duration ?? "-")} min).`,
          type: "other",
          link: "/provider/services",
        });
      } catch (notificationError) {
        console.error("[DELETE /api/services/[id]] notification error:", notificationError);
      }

      return Response.json(
        successResponse(
          null,
          MESSAGES.SUCCESS.DELETE
        )
      );
    }
  );
