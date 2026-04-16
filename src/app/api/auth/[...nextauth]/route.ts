import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";

const handler = NextAuth({
  providers: [
   CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },

  async authorize(credentials) {
    if (!credentials) return null;

    await connectDB();

    const user = await User.findOne({
      email: credentials.email,
    });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isMatch) throw new Error("Invalid credentials");

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  },
})
  ],

  session: {
    strategy: "jwt", // uses JWT internally
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // store role in token
      }
      return token;
    },

    async session({ session, token }) {
       if (session.user && token.role){
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // your custom login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };