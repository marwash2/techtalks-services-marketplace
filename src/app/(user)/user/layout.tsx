import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserSidebar from "@/components/user/UserSidebar";
import { authOptions } from "@/lib/auth";
import UserDashboardSummary from "@/components/user/UserDashboardSummary";
import UserLayoutClient from "@/app/(user)/user/UserLayoutClient";
import { Toaster } from "react-hot-toast";
export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/redirect");
  }

  if (role === "provider") {
    redirect("/provider/dashboard");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Toaster position="top-center" reverseOrder={false} />
        <UserSidebar />
        <div className="min-w-0 flex-1">
          <UserDashboardSummary name={session.user.name} />
          {children}
        </div>
      </div>
    </div>
  );
}
