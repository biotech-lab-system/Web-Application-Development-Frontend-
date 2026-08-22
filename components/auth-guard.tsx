"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, session } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, router, session]);

  if (loading || !session) {
    return (
      <main className="auth-loading" aria-live="polite">
        <LoaderCircle className="spin" />
        <span>Checking your session…</span>
      </main>
    );
  }

  return children;
}
