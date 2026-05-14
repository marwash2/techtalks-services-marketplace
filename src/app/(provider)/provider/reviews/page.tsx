import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import { Review } from "@/models/Review.model";
import { MessageSquare, Star } from "lucide-react";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  serviceTitle: string;
  userName: string;
  serviceImage: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProviderReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const provider = await Provider.findOne({ userId: session.user.id })
    .select("_id")
    .lean<{ _id: string }>();
  if (!provider?._id) {
    return null;
  }

  const reviewsRaw = await Review.find({ providerId: provider._id })
    .populate("serviceId", "title image")
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const reviews: ReviewItem[] = (reviewsRaw as Array<any>).map((review) => ({
    id: String(review._id),
    rating: Number(review.rating ?? 0),
    comment: review.comment ?? "",
    createdAt: new Date(review.createdAt).toISOString(),
    serviceTitle:
      typeof review.serviceId === "object" && review.serviceId?.title
        ? review.serviceId.title
        : "Service",
    serviceImage:
      typeof review.serviceId === "object" && review.serviceId?.image
        ? review.serviceId.image
        : "/dashboard-logo.jpg",
    userName:
      typeof review.userId === "object" && review.userId?.name
        ? review.userId.name
        : "Customer",
  }));

  function renderStars(rating: number) {
    return Array.from({ length: 5 }).map((_, index) => {
      const full = index + 1 <= Math.floor(rating);
      const half = index + 1 === Math.ceil(rating) && rating % 1 !== 0;

      return (
        <Star
          key={index}
          className={`h-5 w-5 transition-all duration-200 ease-out hover:scale-125 hover:text-amber-500 hover:fill-amber-500 cursor-pointer ${
            full || half ? "text-amber-500 fill-amber-500" : "text-slate-300"
          }`}
        />
      );
    });
  }
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8  ">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-sm ">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Reputation
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Reviews</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track ratings and customer feedback for your services.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <p className="text-sm text-slate-500">Average rating</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-3xl font-semibold text-slate-900">
                {averageRating.toFixed(1)}
              </p>

              <div className="flex items-center text-amber-500">
                {renderStars(averageRating)}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <p className="text-sm text-slate-500">Total reviews</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {totalReviews}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm ">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Latest Reviews
          </h2>
        </div>
        {reviews.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No reviews yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <article key={review.id} className="px-6 py-5">
                <div className="flex gap-4">
                  <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={review.serviceImage}
                      alt={review.serviceTitle}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="truncate text-base font-semibold text-slate-900">
                          {review.serviceTitle}
                        </p>
                        <p className="text-sm text-slate-500">
                          By {review.userName}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${review.id}-${index}`}
                          className={`h-4 w-4 transition-all duration-200 ease-out hover:scale-125 cursor-pointer ${
                            index < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300"
                          }`}
                        />
                      ))}

                      <span className="text-sm font-semibold text-slate-700">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
