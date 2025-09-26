"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authService } from "@/lib/auth";
import { addToast } from "@heroui/toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      addToast({
        title: "Error",
        description: "Error al autenticar usuario",
        color: "danger",
      });
      router.push("/login?error=auth_failed");

      return;
    }

    if (token) {
      authService.handleAuthCallback(token);
      router.push("/dashboard");
    } else {
      router.push("/login?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
