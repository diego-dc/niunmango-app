"use client";

import { authService } from "@/lib/auth";
import { useCallback, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(
    async <T = any>(
      endpoint: string,
      options: ApiRequestOptions = {}
    ): Promise<T> => {
      const { authenticated = true, ...fetchOptions } = options;

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
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Convenience methods
  const get = useCallback(
    <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
      makeRequest<T>(endpoint, { ...options, method: "GET" }),
    [makeRequest]
  );

  const post = useCallback(
    <T = any>(
      endpoint: string,
      data?: any,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ) =>
      makeRequest<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [makeRequest]
  );

  const put = useCallback(
    <T = any>(
      endpoint: string,
      data?: any,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ) =>
      makeRequest<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [makeRequest]
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
      makeRequest<T>(endpoint, { ...options, method: "DELETE" }),
    [makeRequest]
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
