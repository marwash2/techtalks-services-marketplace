import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import Booking from "@/models/Booking.model";
import ProviderEarningsDashboard from "@/components/provider/ProviderEarningsDashboard";

type TransactionItem = {
  id: string;
  serviceTitle: string;
  date: string;
  amount: number;
  status: string;
};

export default async function ProviderEarningsPage() {
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

  const bookingsRaw = await Booking.find({ providerId: provider._id })
    .populate("serviceId", "title")
    .sort({ createdAt: -1 })
    .lean();

  const bookings: TransactionItem[] = (bookingsRaw as Array<any>).map(
    (booking) => ({
      id: String(booking._id),
      serviceTitle:
        typeof booking.serviceId === "object" && booking.serviceId?.title
          ? booking.serviceId.title
          : "Service",
      date: new Date(booking.createdAt).toISOString(),
      amount: Number(booking.price ?? 0),
      status: String(booking.status ?? "pending"),
    }),
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <ProviderEarningsDashboard bookings={bookings} />
    </div>
  );
}
