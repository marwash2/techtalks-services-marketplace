//<reference types="next-auth" />
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "user" | "provider" | "admin";
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    role?: "user" | "provider" | "admin";
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "provider" | "admin";
  }
}
