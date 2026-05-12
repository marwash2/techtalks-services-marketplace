import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import { Location } from "@/models/Location.model";
import { requireAuth } from "@/lib/auth-utils";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";

const updateLocationSchema = z.object({
  name:   z.string().min(1).max(100).trim().optional(),
  region: z.string().max(100).trim().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

// PATCH /api/locations/[id] — admin only, update name or region
export const PATCH = withApiHandler(async (req, { params }) => {
  await requireAuth(req, ["admin"]);

  const { id }    = await params;
  const body      = await req.json();
  const validated = updateLocationSchema.parse(body);

  // Check duplicate name if name is being changed
  if (validated.name) {
    const exists = await Location.exists({
      name: { $regex: new RegExp(`^${validated.name}$`, "i") },
      _id:  { $ne: id },
    });
    if (exists) throw new ApiError("Location name already exists", 409);
  }

  const location = await Location.findByIdAndUpdate(
    id,
    { $set: validated },
    { new: true, runValidators: true }
  ).lean();

  if (!location) throw new ApiError("Location not found", 404);

  return Response.json(
    successResponse(
      {
        id:       location._id.toString(),
        name:     location.name,
        region:   location.region ?? null,
        isActive: location.isActive,
      },
      MESSAGES.SUCCESS.UPDATE
    )
  );
});

// DELETE /api/locations/[id] — admin only, soft delete (sets isActive: false)
// Hard delete is intentionally avoided — existing services may reference this location
export const DELETE = withApiHandler(async (req, { params }) => {
  await requireAuth(req, ["admin"]);

  const { id } = await params;

  const location = await Location.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!location) throw new ApiError("Location not found", 404);

  return Response.json(
    successResponse(null, MESSAGES.SUCCESS.DELETE)
  );
});