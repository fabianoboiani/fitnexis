import type { UserRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.tenantId = (token.tenantId as string | null | undefined) ?? null;
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.name = token.name ?? session.user.name ?? "";
      }

      return session;
    }
  }
} satisfies NextAuthConfig;
