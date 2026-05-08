import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { MESSAGES } from "@/constants/config";

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(req: Request, roles: string[] = []) {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new ApiError(MESSAGES.ERROR.UNAUTHORIZED, 401);
  }
  if (roles.length > 0 && !roles.includes(session.user.role as string)) {
    throw new ApiError(MESSAGES.ERROR.FORBIDDEN, 403);
  }
  return session;
}
