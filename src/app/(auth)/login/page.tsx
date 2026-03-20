import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shared/login-form";
import { getCurrentUser, getDefaultAuthenticatedRoute } from "@/lib/auth-helpers";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultAuthenticatedRoute(user));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <LoginForm />
    </main>
  );
}
