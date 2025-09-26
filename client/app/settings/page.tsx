"use client";

import { Spinner } from "@heroui/spinner";

import { Settings } from "@/components/icons";
import { useRequireAuth } from "@/hooks/useAuth";
import { BudgetsSection } from "@/components/features/BudgetsSection";
import { AccountsSection } from "@/components/features/AccountsSection";
import { CategoriesSection } from "@/components/features/CategoriesSection";

export default function SettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuraciones</h1>
          <p className="text-default-500">
            Gestiona tus categorías, presupuestos y cuentas
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Budgets Section */}
      <BudgetsSection />

      {/* Accounts Section */}
      <AccountsSection />
    </div>
  );
}
