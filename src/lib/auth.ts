import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import {User} from "@/models/User.model";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        role: {},
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({
          email: credentials?.email,
        });

        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(
          credentials!.password,
          user.password,
        );

        if (!isMatch) throw new Error("Wrong password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      if (account?.provider !== "credentials") {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "",
            role: "user",
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }

      // For OAuth logins, fetch role from DB when provider user object has no role.
      if (!token.role && token.email) {
        await connectDB();
        const existingUser = await User.findOne({ email: token.email })
          .select("role")
          .lean<{ role?: string }>();

        if (existingUser?.role) {
          token.role = existingUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "user";
        session.user.id = token.sub || session.user.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
