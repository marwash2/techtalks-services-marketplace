import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import { Service } from "@/models/Service.model";
import { Location } from "@/models/Location.model";

export const GET = withApiHandler(async () => {
  await connectDB();

  const [totalServices, totalProviders, totalCities, ratingResult] =
    await Promise.all([
      Service.countDocuments({}),
      Provider.countDocuments({}),
      Location.countDocuments({}),
      Provider.aggregate([
        {
          $match: {
            rating: { $gte: 0 },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

  const averageRating =
    Number(((ratingResult?.[0]?.averageRating ?? 0) * 10).toFixed(0)) / 10;

  return Response.json(
    successResponse({
      totalServices,
      totalProviders,
      totalCities,
      averageRating,
    }),
  );
});
