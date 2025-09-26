"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useDisclosure } from "@heroui/modal";
import NextLink from "next/link";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";

import { useApi } from "@/hooks/useApi";
import { useBudgets, Budget } from "@/hooks/useBudgets";
import { useAccounts } from "@/hooks/useAccounts";
import { useEntries } from "@/hooks/useEntries";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/contexts/auth-context";
import { BudgetCarousel } from "@/components/features/BudgetCarousel";
import { BudgetDetailsModal } from "@/components/features/BudgetDetailsModal";
import { AccountDistributionBar } from "@/components/features/AccountDistributionBar";
import { RecentEntriesList } from "@/components/features/RecentEntriesList";

interface Stats {
  income: { total: number; count: number };
  expenses: { total: number; count: number };
  savings: { total: number; count: number };
  netIncome: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  console.log("current user: ", user);
  const { get, loading } = useApi();
  const { activeBudgets } = useBudgets();
  const { accountsDistribution, netWorth } = useAccounts();
  const { recentEntries } = useEntries();
  const router = useRouter();

  // State
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsData = await get<Stats>("/entries/stats");
        setStats(statsData);
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard.",
          color: "danger",
        });
        console.error("Error loading dashboard data:", error);
      }
    };

    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, get]);

  const handleBudgetClick = (budget: Budget) => {
    setSelectedBudget(budget);
    onOpen();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <p className="text-sm text-default-500 mb-1">Dashboard</p>
          <div className="flex items-start gap-2 flex-1 flex-col">
            <div className="flex gap-2 items-center">
              <Icon
                icon="heroicons:calendar-days"
                height={32}
                width={32}
                className="text-primary"
              />
              <h1 className="text-xl font-bold">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                })}
              </h1>
            </div>
            <h1 className="text-3xl font-bold">
              {new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
            </h1>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            as={NextLink}
            className="font-sm flex flex-col h-fit p-4"
            variant="ghost"
            color="primary"
            href="/settings"
            size="lg"
          >
            <Icon icon="material-symbols:settings-rounded" height={32} />
            Configuraciones
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex">
        <div className="basis-4/8">
          <div className="pb-2">
            <h3 className="text-sm text-gray-400">Balance del Mes</h3>
          </div>
          <div className="pt-0">
            <p
              className={`text-md font-bold ${
                (stats?.netIncome || 0) >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatCurrency(stats?.netIncome || 0)}
            </p>
          </div>
        </div>

        <div className="basis-2/8 flex flex-col items-center justufy-center">
          <div className="pb-2">
            <h3 className="text-sm text-gray-400">
              Ingresos ({stats?.income.count || 0})
            </h3>
          </div>
          <div className="pt-0">
            <p
              className={`text-md font-bold ${
                (stats?.income.count || 0) > 0
                  ? "bg-success w-fit rounded p-[2px]"
                  : ""
              }`}
            >
              {formatCurrency(stats?.income.total || 0)}
            </p>
          </div>
        </div>

        <div className="basis-2/8 flex flex-col items-center justufy-center">
          <div className="pb-2">
            <h3 className="text-sm text-gray-400">
              Gastos ({stats?.expenses.count || 0})
            </h3>
          </div>
          <div className="pt-0">
            <p
              className={`text-md font-bold ${
                (stats?.income.count || 0) > 0
                  ? "bg-danger w-fit rounded p-[2px]"
                  : ""
              }`}
            >
              {formatCurrency(stats?.expenses.total || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Current Budgets Carrousel */}
      <div className="my-6">
        <BudgetCarousel
          budgets={activeBudgets}
          onBudgetClick={handleBudgetClick}
        />
      </div>

      {/* Quick Actions */}

      <div className="grid grid-cols-3 gap-4 my-5">
        <Button
          className="h-20 flex-col"
          color="default"
          variant="bordered"
          onPress={() => router.push("/entries/new?type=INCOME")}
        >
          <Icon icon={"game-icons:receive-money"} height={24} />
          <span className="text-small">Nuevo Ingreso</span>
        </Button>

        <Button
          className="h-20 flex-col"
          color="default"
          variant="bordered"
          onPress={() => router.push("/entries/new?type=EXPENSE")}
        >
          <Icon icon={"game-icons:pay-money"} height={24} />
          <span className="text-small">Nuevo Gasto</span>
        </Button>

        <Button
          className="h-20 flex-col"
          color="default"
          variant="bordered"
          onPress={() => router.push("/entries/new?type=TRANSFER")}
        >
          <Icon icon={"hugeicons:money-exchange-03"} height={24} />
          <span className="text-small">Movimiento</span>
        </Button>
      </div>

      {/* Networth Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-medium">
            Tu capital neto total es{" "}
            <span className="font-bold text-primary text-3xl">
              {formatCurrency(Number(netWorth) || 0)}
            </span>{" "}
            y se distribuye así
          </h3>
        </div>

        {/* Account Distribution Bar */}
        <div>
          <AccountDistributionBar accounts={accountsDistribution} />
        </div>
      </div>

      {/* Last Entries resume */}
      <div className="space-y-6">
        <div className="text-center text-lg">
          <h1 className="font-bold">Entradas recientes</h1>
        </div>

        <div>
          <RecentEntriesList entries={recentEntries} />
        </div>

        <Button
          className="p-5 w-full"
          color="primary"
          variant="ghost"
          onPress={() => router.push("/entries")}
        >
          <Icon icon="streamline-plump:money-cash-bill-1-solid" height={24} />
          <span className="text-small">Ver todas</span>
        </Button>
      </div>

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        budget={selectedBudget}
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>
  );
}
