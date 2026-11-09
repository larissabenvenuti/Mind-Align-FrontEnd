"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, booted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (booted && !user) {
      router.push("/auth");
    }
  }, [user, booted, router]);

  if (!booted || !user) return null;

  return <>{children}</>;
}
