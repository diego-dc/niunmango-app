"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Tooltip } from "@heroui/tooltip";
import { useRequireAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

type EntryType = "INCOME" | "EXPENSE" | "SAVINGS";

interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  date: string;
  description: string;
  category: { name: string };
  entryAccounts: Array<{
    amount: number;
    account: { name: string; type: string };
  }>;
}

interface EntriesResponse {
  entries: Entry[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function EntriesPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { get, loading } = useApi();
  const router = useRouter();

  // State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Load entries
  const loadEntries = async (page: number = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.type && { type: filters.type }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const data = await get<EntriesResponse>(`/entries?${params}`);
      setEntries(data.entries);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadEntries(currentPage);
    }
  }, [authLoading, currentPage, filters]);

  const getTypeColor = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "success";
      case "EXPENSE":
        return "danger";
      case "SAVINGS":
        return "primary";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "Ingreso";
      case "EXPENSE":
        return "Gasto";
      case "SAVINGS":
        return "Ahorro";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "💰";
      case "EXPENSE":
        return "💸";
      case "SAVINGS":
        return "🏦";
      default:
        return "";
    }
  };

  const formatAmount = (amount: number, type: EntryType) => {
    const sign = type === "EXPENSE" ? "-" : "+";
    return `${sign}$${amount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Historial de Entradas</h1>
          <p className="text-default-500 mt-1">{total} entradas encontradas</p>
        </div>
      </div>

      <div className="flex w-full my-6">
        <Button color="primary" onPress={() => router.push("/entries/new")}>
          + Nueva Entrada
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Filtros</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Tipo"
              placeholder="Todos los tipos"
              selectedKeys={filters.type ? [filters.type] : []}
              onSelectionChange={(keys) =>
                setFilters((prev) => ({
                  ...prev,
                  type: (Array.from(keys)[0] as string) || "",
                }))
              }
            >
              <SelectItem key="INCOME">💰 Ingresos</SelectItem>
              <SelectItem key="EXPENSE">💸 Gastos</SelectItem>
            </Select>

            <Input
              label="Fecha Desde"
              type="date"
              value={filters.startDate}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, startDate: value }))
              }
            />

            <Input
              label="Fecha Hasta"
              type="date"
              value={filters.endDate}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, endDate: value }))
              }
            />

            <Button
              variant="flat"
              color="warning"
              onPress={() =>
                setFilters({
                  type: "",
                  categoryId: "",
                  startDate: "",
                  endDate: "",
                  search: "",
                })
              }
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Tabla de entradas"
            isHeaderSticky
            classNames={{
              wrapper: "max-h-[600px]",
            }}
          >
            <TableHeader>
              <TableColumn>TIPO</TableColumn>
              <TableColumn>DESCRIPCIÓN</TableColumn>
              <TableColumn>CATEGORÍA</TableColumn>
              <TableColumn>CUENTAS</TableColumn>
              <TableColumn>MONTO</TableColumn>
              <TableColumn>FECHA</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              items={entries}
              isLoading={loading}
              emptyContent="No se encontraron entradas"
            >
              {(entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Chip
                      color={getTypeColor(entry.type)}
                      variant="flat"
                      size="sm"
                      startContent={<span>{getTypeIcon(entry.type)}</span>}
                    >
                      {getTypeLabel(entry.type)}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.description}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Chip variant="bordered" size="sm">
                      {entry.category.name}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {entry.entryAccounts.map((entryAccount, idx) => (
                        <Tooltip key={idx} content={`$${entryAccount.amount}`}>
                          <Chip size="sm" variant="flat" color="secondary">
                            {entryAccount.account.name}
                          </Chip>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`font-bold ${
                        entry.type === "EXPENSE"
                          ? "text-red-600"
                          : entry.type === "INCOME"
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    >
                      {formatAmount(entry.amount, entry.type)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-small text-default-500">
                      {formatDate(entry.date)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => router.push(`/entries/${entry.id}/edit`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={pages}
            page={currentPage}
            onChange={setCurrentPage}
            color="primary"
            showControls
          />
        </div>
      )}
    </div>
  );
}
