import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import { Service } from "@/models/Service.model";
import Booking from "@/models/Booking.model";
import ProviderOnboardingForm from "@/components/provider/ProviderOnboardingForm";
import StatsCard from "@/components/provider/StatsCard";
import RecentBookings from "@/components/provider/RecentBookings";
import ServicesPreview from "@/components/provider/ServicesPreview";
import QuickActions from "@/components/provider/QuickActions";
import PendingRequests from "@/components/provider/PendingRequests";
import {
  Star,
  Calendar,
  DollarSign,
  Briefcase,
  Plus,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardProvider {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  location: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  reviews: Array<{ rating?: number; comment?: string; createdAt?: string }>;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalServices: number;
  totalBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface RecentBookingItem {
  _id: string;
  userId?: { name?: string } | string;
  serviceTitle: string;
  date: string;
  price: number;
  status: string;
}

interface ActiveServiceItem {
  _id: string;
  title: string;
  price: number;
}

interface PendingRequestItem {
  _id: string;
  userName: string;
  serviceTitle: string;
  date: string;
  price: number;
  status: string;
}

interface LeanProvider {
  _id: { toString(): string };
  userId: { toString(): string };
  businessName: string;
  description: string;
  location: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  reviews: Array<{
    rating?: number;
    comment?: string;
    createdAt?: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface LeanBooking {
  _id: { toString(): string };
  userId?: { name?: string } | string;
  serviceId?: { title?: string } | string;
  createdAt: Date | string;
  date?: Date | string;
  price?: number;
  status?: string;
}

interface LeanService {
  _id: { toString(): string };
  title?: string;
  price?: number;
  isActive?: boolean;
}

function toISOString(value: Date | string | undefined): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

async function getDashboardData(userId: string): Promise<{
  provider: DashboardProvider | null;
  stats: DashboardStats;
  recentBookings: RecentBookingItem[];
  pendingRequests: PendingRequestItem[];
  activeServices: ActiveServiceItem[];
}> {
  await connectDB();

  const providerDoc = await Provider.findOne({ userId }).lean();
  const leanProvider = providerDoc as unknown as LeanProvider | null;
  const services = providerDoc
    ? await Service.find({ providerId: leanProvider?._id }).lean()
    : [];
  const bookings = providerDoc
    ? await Booking.find({ providerId: leanProvider?._id })
        .populate("userId", "name")
        .populate("serviceId", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    : [];
  const pendingBookings = providerDoc
    ? await Booking.find({ providerId: leanProvider?._id, status: "pending" })
        .populate("userId", "name")
        .populate("serviceId", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    : [];

  const provider: DashboardProvider | null = leanProvider
    ? {
        _id: leanProvider._id.toString(),
        userId: leanProvider.userId.toString(),
        businessName: leanProvider.businessName || "",
        description: leanProvider.description || "",
        location: leanProvider.location || "",
        rating: leanProvider.rating || 0,
        totalReviews: leanProvider.totalReviews || 0,
        isVerified: leanProvider.isVerified || false,
        reviews: leanProvider.reviews.map((r) => ({
          rating: r.rating || 0,
          comment: r.comment || "",
          createdAt: toISOString(r.createdAt),
        })),
        createdAt: toISOString(leanProvider.createdAt),
        updatedAt: toISOString(leanProvider.updatedAt),
      }
    : null;

  const leanBookings = bookings as unknown as LeanBooking[];
  const leanServices = services as unknown as LeanService[];

  const totalEarnings = leanBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price ?? 0), 0);

  const reviews = leanProvider?.reviews ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const leanPendingBookings = pendingBookings as unknown as LeanBooking[];

  return {
    provider,
    stats: {
      totalServices: leanServices.length,
      totalBookings: leanBookings.length,
      totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    },
    recentBookings: leanBookings.slice(0, 3).map((b) => ({
      _id: b._id.toString(),
      userId: b.userId,
      date: toISOString(b.date ?? b.createdAt),
      price: b.price ?? 0,
      status: b.status ?? "pending",
      serviceTitle:
        typeof b.serviceId === "object" && b.serviceId?.title
          ? b.serviceId.title
          : "Service request",
    })),
    pendingRequests: leanPendingBookings.map((b) => ({
      _id: b._id.toString(),
      userName:
        typeof b.userId === "object" && b.userId?.name
          ? b.userId.name
          : "Customer",
      serviceTitle:
        typeof b.serviceId === "object" && b.serviceId?.title
          ? b.serviceId.title
          : "Service request",
      date: toISOString(b.date ?? b.createdAt),
      price: b.price ?? 0,
      status: b.status ?? "pending",
    })),
    activeServices: leanServices
      .filter((s) => s.isActive !== false)
      .map((s) => ({
        _id: s._id.toString(),
        title: s.title ?? "Untitled Service",
        price: s.price ?? 0,
      })),
  };
}

export default async function ProviderDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 py-14 px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Unable to load dashboard
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            Please sign in again to access your provider dashboard.
          </p>
        </div>
      </div>
    );
  }

  const data = await getDashboardData(session.user.id);

  if (!data.provider) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProviderOnboardingForm />
        </div>
      </div>
    );
  }

  const { stats, recentBookings, pendingRequests, activeServices } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              Provider dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Welcome back,
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {data.provider.businessName} - Manage your services and bookings.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/provider/services"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Link>
          </div>
        </div>

        {/* Success Banner */}
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm text-emerald-900 shadow-sm sm:px-8">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Your provider profile is complete.</p>
              <p className="mt-1 leading-6 text-slate-700">
                You can now add services, manage bookings, and receive requests
                from customers.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Services"
            value={stats.totalServices}
            icon={Briefcase}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            iconColor="text-green-600"
            bgColor="bg-green-50"
          />
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatsCard
            title={`Rating (${stats.totalReviews} reviews)`}
            value={stats.averageRating}
            icon={Star}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PendingRequests requests={pendingRequests} />
            <RecentBookings bookings={recentBookings} />
          </div>

          <div className="space-y-6">
            <QuickActions />
            <ServicesPreview services={activeServices} />
          </div>
        </div>
      </div>
    </div>
  );
}
