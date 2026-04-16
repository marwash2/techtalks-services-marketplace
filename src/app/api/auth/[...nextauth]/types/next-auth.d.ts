import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role: "user" | "provider" | "admin";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: "user" | "provider" | "admin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "provider" | "admin";
  }
}