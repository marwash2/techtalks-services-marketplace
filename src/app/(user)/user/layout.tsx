import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserSidebar from "@/components/user/UserSidebar";
import { authOptions } from "@/lib/auth";
import UserLayoutClient from "@/app/(user)/user/UserLayoutClient";
import { Toaster } from "react-hot-toast";
import UserMobileHeader from "@/components/user/UserMobileHeader";
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
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <UserSidebar />
  
      <UserLayoutClient>{children}</UserLayoutClient>
    </>
  );
}
