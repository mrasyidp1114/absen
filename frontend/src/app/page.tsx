"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathFor } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? dashboardPathFor(user.role) : "/login");
  }, [loading, user, router]);

  return null;
}
