import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import { Location } from "@/models/Location.model";
import { requireAuth } from "@/lib/auth-utils";
import { ApiError } from "@/lib/api-error";
import { connectDB } from "@/lib/db";
import { z } from "zod";

const createLocationSchema = z.object({
  name:   z.string().min(1, "Name is required").max(100).trim(),
  region: z.string().max(100).trim().optional(),
});

// GET /api/locations — public, returns all active locations sorted by name
// Used for provider dropdowns when creating/editing a service
export const GET = withApiHandler(async () => {
  await connectDB();

  const locations = await Location.find({ isActive: true })
    .sort({ name: 1 })
    .select("_id name region")
    .lean()
    .exec();

  return Response.json(
    successResponse(
      locations.map((l) => ({
        id:     l._id.toString(),
        name:   l.name,
        region: l.region ?? null,
      }))
    )
  );
});

// POST /api/locations — admin only, creates a new location
export const POST = withApiHandler(async (req) => {
  await requireAuth(req, ["admin"]);
  await connectDB();

  const body      = await req.json();
  const validated = createLocationSchema.parse(body);

  // Check for duplicate name explicitly for a clean 409
  const exists = await Location.exists({
    name: { $regex: new RegExp(`^${validated.name}$`, "i") },
  });
  if (exists) throw new ApiError("Location name already exists", 409);

  const location = await Location.create({
    name:   validated.name,
    region: validated.region,
  });

  return Response.json(
    successResponse(
      {
        id:       location._id.toString(),
        name:     location.name,
        region:   location.region ?? null,
        isActive: location.isActive,
      },
      MESSAGES.SUCCESS.CREATE
    ),
    { status: 201 }
  );
});
