import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/features/auth/schemas";
import { DEFAULT_CATEGORIES } from "@/config/app";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
    async signIn({ user, account }) {
      // Seed default categories for new OAuth users
      if (account?.provider !== "credentials" && user.id) {
        const existing = await prisma.category.count({
          where: { userId: user.id },
        });
        if (existing === 0) {
          await seedDefaultData(user.id);
        }
      }
      return true;
    },
  },
});

export async function seedDefaultData(userId: string) {
  await prisma.$transaction([
    prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId,
        isDefault: true,
      })),
      skipDuplicates: true,
    }),
    prisma.wallet.create({
      data: {
        name: "Dompet Tunai",
        type: "CASH",
        balance: 0,
        userId,
        icon: "💵",
        color: "#10b981",
      },
    }),
  ]);
}