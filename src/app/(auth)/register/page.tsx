import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/shared/register-form";
import { getCurrentUser, getDefaultAuthenticatedRoute } from "@/lib/auth-helpers";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultAuthenticatedRoute(user));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <RegisterForm />
    </main>
  );
}
