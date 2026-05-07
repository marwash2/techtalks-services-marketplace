import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category.model";
import { Provider } from "@/models/Provider.model";
import { toCategoryListDTO } from "@/lib/dto/category.dto";

export const GET = withApiHandler(async () => {
  await connectDB();

  const [categories, locations] = await Promise.all([
    Category.find().sort({ name: 1 }).exec(),
    Provider.distinct("location", {
      location: { $exists: true, $ne: "" },
    }),
  ]);

  return Response.json(
    successResponse({
      categories: toCategoryListDTO(categories),
      locations: locations
        .map((location) => String(location).trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    }),
  );
});
