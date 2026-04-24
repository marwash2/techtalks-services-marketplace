import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(req: Request, roles: string[] = []) {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (roles.length > 0 && !roles.includes(session.user.role as string)) {
    throw new Error("Forbidden");
  }
  return session;
}
