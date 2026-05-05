import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { MESSAGES } from "@/constants/config";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}


export async function requireSession(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new ApiError(MESSAGES.ERROR.UNAUTHORIZED, 401);
  }

  return session.user as SessionUser;
}


export async function requireRole(role: string): Promise<SessionUser> {
  const user = await requireSession();

  if (user.role !== role) {
    throw new ApiError(MESSAGES.ERROR.FORBIDDEN, 403);
  }

  return user;
}