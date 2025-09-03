"use client";

import { useAuth as useAuthContext } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth: boolean = true) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  return {
    session: { user }, // For backwards compatibility
    user,
    status: isLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated",
    isLoading,
    isAuthenticated,
    isUnauthenticated: !isAuthenticated,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useOptionalAuth() {
  return useAuth(false);
}