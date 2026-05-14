import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Provider } from "@/models/Provider.model";
import ProviderSidebar from "@/components/provider/ProviderSidebar";
import ProviderContentWrapper from "@/components/provider/ProviderContentWrapper";
import ProviderOnboardingForm from "@/components/provider/ProviderOnboardingForm";
import ProviderMobileHeader from "@/components/provider/ProviderMobileHeader";

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
  const providerStatus =
    (
      provider as {
        providerStatus?: "pending" | "approved" | "rejected";
      } | null
    )?.providerStatus ?? null;

  if (!provider) {
    return (
      <>
        <ProviderSidebar />
        <ProviderContentWrapper>
          <div className="mx-auto max-w-7xl py-8">
            <ProviderOnboardingForm />
          </div>
        </ProviderContentWrapper>
      </>
    );
  }

  if (providerStatus !== "approved") {
    const onboardingProvider = provider as {
      _id: { toString(): string };
      businessName?: string;
      location?: string;
      description?: string;
      avatar?: string | null;
      providerStatus?: "pending" | "approved" | "rejected";
    };

    return (
      <>
        <ProviderSidebar />
        <ProviderMobileHeader /> {/* Add the mobile header for onboarding */}
        <ProviderContentWrapper>
          <div className="mx-auto max-w-7xl py-8">
            <ProviderOnboardingForm
              initialProvider={{
                id: onboardingProvider._id.toString(),
                businessName: onboardingProvider.businessName ?? "",
                location: onboardingProvider.location ?? "",
                description: onboardingProvider.description ?? "",
                avatar: onboardingProvider.avatar ?? "",
                providerStatus: onboardingProvider.providerStatus ?? "pending",
              }}
            />
          </div>
        </ProviderContentWrapper>
      </>
    );
  }

  return (
    <>
      <ProviderSidebar />
      <ProviderContentWrapper>
        <div className="mx-auto max-w-7xl ">
          <div className="min-w-0">{children}</div>
        </div>
      </ProviderContentWrapper>
    </>
  );
}
