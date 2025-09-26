"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { User, authService } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();

        setUser(currentUser);

        if (!currentUser) {
          authService.removeToken();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshToken = async () => {
    const success = await authService.refreshToken();

    if (success) {
      const currentUser = await authService.getCurrentUser();

      setUser(currentUser);
    }

    return success;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
