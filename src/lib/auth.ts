import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthService } from "@/modules/auth/services/auth.service";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        return AuthService.authenticateWithCredentials({
          email: typeof credentials?.email === "string" ? credentials.email : "",
          password: typeof credentials?.password === "string" ? credentials.password : ""
        });
      }
    })
  ]
});
