"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Avatar, 
  Divider,
  Progress,
  Chip,
  Tab,
  Tabs,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

interface Stats {
  income: { total: number; count: number };
  expenses: { total: number; count: number };
  savings: { total: number; count: number };
  netIncome: number;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  isActive: boolean;
}

interface Budget {
  id: string;
  name: string;
  totalBudgeted: number;
  totalSpent: number;
  overallPercentage: number;
  budgetItems: Array<{
    category: { name: string };
    budgetedAmount: number;
    spent: number;
    percentage: number;
  }>;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { get, loading } = useApi();
  const router = useRouter();

  // State
  const [stats, setStats] = useState<Stats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [netWorth, setNetWorth] = useState(0);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, accountsData, netWorthData, budgetData] = await Promise.all([
          get<Stats>("/entries/stats"),
          get<Account[]>("/accounts"),
          get<{ netWorth: number }>("/accounts/net-worth"),
          get<Budget>("/budgets/current").catch(() => null)
        ]);

        setStats(statsData);
        setAccounts(accountsData);
        setNetWorth(netWorthData.netWorth);
        setCurrentBudget(budgetData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, get]);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "SAVINGS": return "success";
      case "CHECKING": return "primary";
      case "CREDIT_CARD": return "warning";
      case "CASH": return "secondary";
      case "INVESTMENT": return "default";
      default: return "default";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "SAVINGS": return "Ahorros";
      case "CHECKING": return "Cuenta Corriente";
      case "CREDIT_CARD": return "Tarjeta Crédito";
      case "CASH": return "Efectivo";
      case "INVESTMENT": return "Inversión";
      default: return type;
    }
  };

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
        
        <div className="flex items-center gap-4">
          <Avatar
            name={user?.name || "Usuario"}
            size="md"
          />
          <Button
            color="danger"
            variant="flat"
            onClick={handleSignOut}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Capital Neto</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-bold text-green-600">
              ${netWorth.toFixed(2)}
            </p>
            <p className="text-small text-default-500">Total en todas las cuentas</p>
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
              ${stats?.expenses.total.toFixed(2) || "0.00"}
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
            <p className={`text-2xl font-bold ${
              (stats?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              ${stats?.netIncome.toFixed(2) || "0.00"}
            </p>
            <p className="text-small text-default-500">Ingresos - Gastos</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              color="success" 
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
              color="primary" 
              variant="flat" 
              className="h-20 flex-col"
              onPress={() => router.push("/entries/new?type=SAVINGS")}
            >
              <span className="text-xl mb-1">🏦</span>
              <span className="text-small">Nuevo Ahorro</span>
            </Button>
            
            <Button 
              color="secondary" 
              variant="flat" 
              className="h-20 flex-col"
              onPress={() => router.push("/entries")}
            >
              <span className="text-xl mb-1">📊</span>
              <span className="text-small">Ver Historial</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Content Tabs */}
      <Tabs aria-label="Dashboard content" variant="underlined" color="primary">
        <Tab key="accounts" title="Cuentas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold">Mis Cuentas</h3>
                <Button size="sm" color="primary" variant="flat">
                  + Nueva Cuenta
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <Table aria-label="Tabla de cuentas">
                <TableHeader>
                  <TableColumn>NOMBRE</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn>BALANCE</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                </TableHeader>
                <TableBody items={accounts}>
                  {(account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <p className="font-medium">{account.name}</p>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getAccountTypeColor(account.type)} 
                          variant="flat" 
                          size="sm"
                        >
                          {getAccountTypeLabel(account.type)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          account.balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          ${account.balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={account.isActive ? "success" : "default"}
                          variant="flat"
                          size="sm"
                        >
                          {account.isActive ? "Activa" : "Inactiva"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="budget" title="Presupuesto">
          {currentBudget ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className="text-lg font-semibold">{currentBudget.name}</h3>
                    <p className="text-small text-default-500">
                      Progreso general: {currentBudget.overallPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <Button size="sm" color="primary" variant="flat">
                    Editar Presupuesto
                  </Button>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-small font-medium">Progreso Total</span>
                    <span className="text-small">
                      ${currentBudget.totalSpent.toFixed(2)} / ${currentBudget.totalBudgeted.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={currentBudget.overallPercentage} 
                    color={currentBudget.overallPercentage > 100 ? "danger" : "primary"}
                    className="mb-4"
                  />
                </div>

                <div className="space-y-4">
                  {currentBudget.budgetItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.category.name}</h4>
                        <span className="text-small">
                          ${item.spent.toFixed(2)} / ${item.budgetedAmount.toFixed(2)}
                        </span>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        color={item.percentage > 100 ? "danger" : "success"}
                        size="sm"
                      />
                      <p className="text-tiny text-default-500 mt-1">
                        {item.percentage.toFixed(1)}% utilizado
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <div className="mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sin Presupuesto Activo</h3>
                <p className="text-default-500 mb-4">
                  Crea tu primer presupuesto para controlar tus gastos
                </p>
                <Button color="primary">
                  Crear Presupuesto
                </Button>
              </CardBody>
            </Card>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}