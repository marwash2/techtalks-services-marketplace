import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User.model";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // CREDENTIALS LOGIN
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

        if (!user) {
          throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!isMatch) {
          throw new Error("Wrong password");
        }

        // IMPORTANT:
        // Return ALL custom fields you want inside JWT/session
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          providerStatus:
            user.providerStatus || "inactive",
        };
      },
    }),

    // GOOGLE LOGIN
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID!,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // USE JWT SESSION
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // GOOGLE SIGN-IN DB SAVE
    async signIn({
      user,
      account,
    }) {
      await connectDB();

      if (
        account?.provider !==
        "credentials"
      ) {
        let existingUser =
          await User.findOne({
            email: user.email,
          });

        if (!existingUser) {
          existingUser =
            await User.create({
              name: user.name,
              email: user.email,
              password: "",
              role: "user",
              providerStatus:
                "inactive",
            });
        }

        // VERY IMPORTANT:
        // Ensure Google users also have id + role
        user.id =
          existingUser._id.toString();

        user.role =
          existingUser.role;

        
      }

      return true;
    },

    // JWT CALLBACK
    async jwt({
      token,
      user,
    }) {
      // Runs on login
      if (user) {
        token.id = user.id;
        token.role =
          user.role;
        
      }

      return token;
    },

    // SESSION CALLBACK
    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          token.id as string;

        session.user.role =
          token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret:
    process.env.NEXTAUTH_SECRET,
};