"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        startTransition(async () => {
          await signOut({
            callbackUrl: "/login"
          });
        })
      }
    >
      <LogOut className="size-4" />
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
