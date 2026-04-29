import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role === "provider") {
    redirect("/provider/dashboard");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/user/dashboard");
}
