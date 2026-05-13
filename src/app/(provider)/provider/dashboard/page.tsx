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
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// Types 

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
  pendingCount: number;
  completedThisWeek: number;
  earningsThisWeek: number;
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

//  Helpers 

function toISOString(value: Date | string | undefined): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
}

//  Data fetching 

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

  const services = leanProvider
    ? await Service.find({ providerId: leanProvider._id }).lean()
    : [];

  const bookings = leanProvider
    ? await Booking.find({ providerId: leanProvider._id })
        .populate("userId", "name")
        .populate("serviceId", "title")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    : [];

  const pendingBookings = leanProvider
    ? await Booking.find({ providerId: leanProvider._id, status: "pending" })
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
  const leanPendingBookings = pendingBookings as unknown as LeanBooking[];

  const completed = leanBookings.filter((b) => b.status === "completed");
  const totalEarnings = completed.reduce((sum, b) => sum + (b.price ?? 0), 0);

  const completedThisWeek = completed.filter((b) =>
    isThisWeek(toISOString(b.date ?? b.createdAt))
  );
  const earningsThisWeek = completedThisWeek.reduce(
    (sum, b) => sum + (b.price ?? 0),
    0
  );

  const reviews = leanProvider?.reviews ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  return {
    provider,
    stats: {
      totalServices: leanServices.filter((s) => s.isActive !== false).length,
      totalBookings: leanBookings.length,
      totalEarnings,
      earningsThisWeek,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      pendingCount: leanPendingBookings.length,
      completedThisWeek: completedThisWeek.length,
    },
    recentBookings: leanBookings.slice(0, 5).map((b) => ({
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

//  Page component

export default async function ProviderDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-10 shadow-sm text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400 mb-4" />
          <h1 className="text-lg font-semibold text-slate-900">
            Session expired
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please sign in again to access your provider dashboard.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Sign in
          </Link>
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

  const { provider, stats, recentBookings, pendingRequests, activeServices } =
    data;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
              Provider dashboard
            </p>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 leading-6">
              {provider.businessName}
              {provider.location && ` · ${provider.location}`}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/provider/availability"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              Availability
            </Link>
            <Link
              href="/provider/services/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus className="h-4 w-4" />
              Add service
            </Link>
          </div>
        </div>

        {/* ── Verified / pending banner ── */}
        {provider.isVerified ? (
          <div className="flex items-start gap-3 rounded-[20px] border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm shadow-sm">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-emerald-800">
                Your profile is verified and live
              </p>
              <p className="mt-0.5 text-emerald-700/80 text-xs leading-5">
                Customers can discover and book your services. Keep your
                availability up to date.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 px-6 py-4 text-sm shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-800">
                Profile under review
              </p>
              <p className="mt-0.5 text-amber-700/80 text-xs leading-5">
                Your profile is being reviewed. You&apos;ll be notified once
                it&apos;s approved and visible to customers.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active services"
            value={stats.totalServices}
            icon={Briefcase}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            delta={stats.totalServices > 0 ? `${stats.totalServices} listed` : undefined}
          />
          <StatsCard
            title="Total bookings"
            value={stats.totalBookings}
            icon={Calendar}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
            delta={
              stats.completedThisWeek > 0
                ? `${stats.completedThisWeek} completed this week`
                : undefined
            }
          />
          <StatsCard
            title="Total earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
            delta={
              stats.earningsThisWeek > 0
                ? `$${stats.earningsThisWeek.toFixed(0)} this week`
                : undefined
            }
          />
          <StatsCard
            title={`Rating (${stats.totalReviews} reviews)`}
            value={stats.averageRating || "—"}
            icon={Star}
            iconColor="text-violet-600"
            bgColor="bg-violet-50"
            delta={
              stats.averageRating >= 4.5
                ? "Excellent standing"
                : stats.averageRating >= 3.5
                ? "Good standing"
                : stats.totalReviews === 0
                ? "No reviews yet"
                : undefined
            }
          />
        </div>

        {/* ── Main content ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: pending + recent */}
          <div className="lg:col-span-2 space-y-6">
            <PendingRequests requests={pendingRequests} />
            <RecentBookings bookings={recentBookings} />
          </div>

          {/* Right column: quick actions + services */}
          <div className="space-y-6">
            <QuickActions />
            <ServicesPreview services={activeServices} />
          </div>
        </div>
      </div>
    </div>
  );
}