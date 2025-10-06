"use client";

import { addToast } from "@heroui/toast";
import { useCallback, useState } from "react";

import { authService } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
  silentError?: boolean; // Don't show toast for errors
}

export function useApi() {
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(
    async <T = any>(
      endpoint: string,
      options: ApiRequestOptions = {},
    ): Promise<T> => {
      const {
        authenticated = true,
        silentError = false,
        ...fetchOptions
      } = options;

      setLoading(true);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...((fetchOptions.headers as Record<string, string>) || {}),
        };

        // Add Authorization header if authenticated and token exists
        if (authenticated && authService.getToken()) {
          headers["Authorization"] = `Bearer ${authService.getToken()}`;
        }

        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
          ...fetchOptions,
          headers,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));

          // Only show toast if not silent error
          if (!silentError) {
            addToast({
              title: "Error en la solicitud",
              description:
                error.error ||
                "Error del servidor. Intenta de nuevo más tarde.",
              color: "danger",
            });
          }
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        // Handle empty responses (like 204 No Content)
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        return data;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Convenience methods
  const get = useCallback(
    <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
      makeRequest<T>(endpoint, { ...options, method: "GET" }),
    [makeRequest],
  );

  const post = useCallback(
    <T = any>(
      endpoint: string,
      data?: any,
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) =>
      makeRequest<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [makeRequest],
  );

  const put = useCallback(
    <T = any>(
      endpoint: string,
      data?: any,
      options?: Omit<ApiRequestOptions, "method" | "body">,
    ) =>
      makeRequest<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [makeRequest],
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
      makeRequest<T>(endpoint, { ...options, method: "DELETE" }),
    [makeRequest],
  );

  return {
    loading,
    makeRequest,
    get,
    post,
    put,
    delete: del,
  };
}
