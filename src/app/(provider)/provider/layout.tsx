import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import ProviderSidebar from "@/components/provider/ProviderSidebar";
import ProviderOnboardingForm from "@/components/provider/ProviderOnboardingForm";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 py-14 px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Access denied
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            You must sign in with a provider account to access this area.
          </p>
        </div>
      </div>
    );
  }

  await connectDB();
  const provider = await Provider.findOne({ userId: session.user.id }).lean();

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <ProviderOnboardingForm />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProviderSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
