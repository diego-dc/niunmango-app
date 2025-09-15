"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";

import NextLink from "next/link";
import { useApi } from "@/hooks/useApi";

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
  const router = useRouter();

  // State
  const [stats, setStats] = useState<Stats | null>(null);
  const [netWorth, setNetWorth] = useState(0);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, netWorthData] = await Promise.all([
          get<Stats>("/entries/stats"),
          get<{ netWorth: number }>("/accounts/net-worth"),
        ]);

        setStats(statsData);
        setNetWorth(Number(netWorthData?.netWorth) || 0);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, get]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">
            Bienvenido de vuelta, {user?.name}
          </p>
        </div>
      </div>

      {/* Quick Actions */}

      <h3 className="text-lg font-semibold">Acciones Rápidas</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
        <Button
          color="success"
          variant="flat"
          className="h-20 flex-col"
          onPress={() => router.push("/entries/new?type=INCOME")}
        >
          <span className="text-xl mb-1">💰</span>
          <span className="text-small">Nuevo Ingreso</span>
        </Button>

        <Button
          color="danger"
          variant="flat"
          className="h-20 flex-col"
          onPress={() => router.push("/entries/new?type=EXPENSE")}
        >
          <span className="text-xl mb-1">💸</span>
          <span className="text-small">Nuevo Gasto</span>
        </Button>

        <Button
          color="secondary"
          variant="flat"
          className="h-20 flex-col col-span-2"
          onPress={() => router.push("/entries")}
        >
          <span className="text-xl mb-1">📊</span>
          <span className="text-small">Ver Historial</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Capital Neto</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-bold text-green-600">
              ${(Number(netWorth) || 0).toFixed(2)}
            </p>
            <p className="text-small text-default-500">
              Total en todas las cuentas
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Ingresos del Mes</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-bold text-blue-600">
              ${stats?.income.total.toFixed(2) || "0.00"}
            </p>
            <p className="text-small text-default-500">
              {stats?.income.count || 0} transacciones
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Gastos del Mes</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-bold text-red-600">
              ${stats?.expenses.total || "0.00"}
            </p>
            <p className="text-small text-default-500">
              {stats?.expenses.count || 0} transacciones
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Balance del Mes</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p
              className={`text-2xl font-bold ${
                (stats?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${stats?.netIncome || "0.00"}
            </p>
            <p className="text-small text-default-500">Ingresos - Gastos</p>
          </CardBody>
        </Card>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h3 className="text-lg font-semibold">
                Configuración Financiera
              </h3>
              <p className="text-small text-default-500">
                Administra tus categorías, presupuestos y cuentas
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="text-center py-12">
          <div className="mb-6">
            <span className="text-6xl">⚙️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Configura tu App Financiera
          </h3>
          <p className="text-default-500 mb-6 max-w-md mx-auto">
            Para aprovechar al máximo NiunMango, configura tus categorías de
            gastos, crea presupuestos y administra tus cuentas desde la página
            de configuraciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={NextLink}
              href="/settings"
              color="primary"
              size="lg"
              className="font-medium"
            >
              Ir a Configuraciones
            </Button>
            <Button
              as={NextLink}
              href="/entries"
              variant="bordered"
              size="lg"
              className="font-medium"
            >
              Ver Mis Entradas
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
