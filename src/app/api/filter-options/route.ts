import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";

import { Category }from "@/models/Category.model";
import { Location } from "@/models/Location.model";
import { toCategoryListDTO } from "@/lib/dto/category.dto";

export const GET = withApiHandler(async () => {
  await connectDB();

  const [categories, locations] = await Promise.all([
    Category.find().sort({ name: 1 }).exec(),
    Location.find({ isActive: true })
      .sort({ name: 1 })
      .select("name region")
      .lean()
      .exec(),
  ]);

  return Response.json(
    successResponse({
      categories: toCategoryListDTO(categories),
      locations: locations.map((location) => location.name),
    }),
  );
});
