"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
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
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { useRequireAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/formatters";

type EntryType = "INCOME" | "EXPENSE" | "TRANSFER";

interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  date: string;
  description: string;
  category: { id: string; name: string } | null;
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
  const { get, put, delete: deleteApi, loading } = useApi();
  const router = useRouter();

  // State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    type: "",
    amount: "",
    description: "",
    categoryId: "",
    date: "",
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [, setAccounts] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

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
    } catch {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las entradas.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadEntries(currentPage);
      loadCategories();
      loadAccounts();
    }
  }, [authLoading, currentPage, filters]);

  const loadCategories = async () => {
    try {
      const data =
        await get<Array<{ id: string; name: string }>>("/categories");

      setCategories(data);
    } catch {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        color: "danger",
      });
    }
  };

  const loadAccounts = async () => {
    try {
      const data =
        await get<Array<{ id: string; name: string; type: string }>>(
          "/accounts",
        );

      setAccounts(data);
    } catch {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las cuentas.",
        color: "danger",
      });
    }
  };

  const hasActiveFilters = () => {
    return (
      filters.type ||
      filters.categoryId ||
      filters.startDate ||
      filters.endDate ||
      filters.search
    );
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      categoryId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const getTypeColor = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "success";
      case "EXPENSE":
        return "danger";
      case "TRANSFER":
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
      case "TRANSFER":
        return "Transferencia";
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
      case "TRANSFER":
        return "🔄";
      default:
        return "";
    }
  };

  const formatAmount = (amount: number, type: EntryType) => {
    if (type === "TRANSFER") {
      return formatCurrency(amount); // No sign for transfers
    }
    const sign = type === "EXPENSE" ? "-" : "+";

    return `${sign}${formatCurrency(amount).substring(1)}`; // Remove $ from formatCurrency and add our sign
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const openEntryModal = (entry: Entry) => {
    setSelectedEntry(entry);
    setEditForm({
      type: entry.type,
      amount: entry.amount.toString(),
      description: entry.description,
      categoryId: entry.category?.id || "",
      date: entry.date.split("T")[0],
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const closeEntryModal = () => {
    setSelectedEntry(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const confirmDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setEntryToDelete(null);
    setShowDeleteConfirm(false);
  };

  const deleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      await deleteApi(`/entries/${entryToDelete}`);
      await loadEntries(currentPage);
      closeEntryModal();
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
      addToast({
        title: "Éxito",
        description: "Entrada eliminada exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la entrada.",
        color: "danger",
      });
    }
  };

  const updateEntry = async () => {
    if (!selectedEntry) return;

    try {
      const updateData = {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        categoryId: editForm.categoryId,
        date: editForm.date,
      };

      const updatedEntry = await put(
        `/entries/${selectedEntry.id}`,
        updateData,
      );

      await loadEntries(currentPage);

      // Update the selected entry in the modal with the latest data
      setSelectedEntry(updatedEntry);
      setIsEditMode(false);
      addToast({
        title: "Éxito",
        description: "Entrada actualizada exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo actualizar la entrada.",
        color: "danger",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Historial de Entradas</h1>
        </div>
      </div>

      <div className="flex justify-between items-center w-full my-6">
        <Button color="primary" onPress={() => router.push("/entries/new")}>
          + Nueva Entrada
        </Button>

        <Popover>
          <PopoverTrigger>
            <Button color="default" variant="flat">
              🔍 Filtros{" "}
              {hasActiveFilters() &&
                `(${Object.values(filters).filter(Boolean).length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="p-2 min-w-80">
              <div className="grid grid-cols-1 gap-4">
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
                  <SelectItem key="TRANSFER">🔄 Transferencias</SelectItem>
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
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters Button - Show only when filters are active */}
      {hasActiveFilters() && (
        <div className="flex justify-center mb-6">
          <Button
            color="warning"
            size="sm"
            variant="flat"
            onPress={clearFilters}
          >
            🗑️ Limpiar Filtros
          </Button>
        </div>
      )}

      {/* Entries Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            isHeaderSticky
            aria-label="Tabla de entradas"
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
              emptyContent="No se encontraron entradas"
              isLoading={loading}
              items={entries}
            >
              {(entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-default-100"
                  onClick={() => openEntryModal(entry)}
                >
                  <TableCell>
                    <Chip
                      color={getTypeColor(entry.type)}
                      size="sm"
                      startContent={<span>{getTypeIcon(entry.type)}</span>}
                      variant="flat"
                    >
                      {getTypeLabel(entry.type)}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium" title={entry.description}>
                        {truncateText(entry.description, 10)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Chip size="sm" variant="bordered">
                      {entry.category?.name || "Sin categoría"}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {entry.entryAccounts.map((entryAccount, idx) => (
                        <Tooltip key={idx} content={`$${entryAccount.amount}`}>
                          <Chip color="secondary" size="sm" variant="flat">
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
                        color="primary"
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          openEntryModal(entry);
                          setIsEditMode(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          confirmDelete(entry.id);
                        }}
                      >
                        Eliminar
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
            showControls
            color="primary"
            page={currentPage}
            total={pages}
            onChange={setCurrentPage}
          />
        </div>
      )}

      {/* Entry Details Modal */}
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isModalOpen}
        scrollBehavior="inside"
        size="2xl"
        onClose={closeEntryModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>{selectedEntry && getTypeIcon(selectedEntry.type)}</span>
              <span>Detalles de la Entrada</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedEntry && (
              <div className="space-y-4">
                {!isEditMode ? (
                  // View Mode
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Tipo</p>
                        <Chip
                          color={getTypeColor(selectedEntry.type)}
                          size="sm"
                          startContent={
                            <span>{getTypeIcon(selectedEntry.type)}</span>
                          }
                          variant="flat"
                        >
                          {getTypeLabel(selectedEntry.type)}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Fecha</p>
                        <p className="font-medium">
                          {formatDate(selectedEntry.date)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Descripción</p>
                      <p className="font-medium">{selectedEntry.description}</p>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Categoría</p>
                      <Chip size="sm" variant="bordered">
                        {selectedEntry.category?.name || "Sin categoría"}
                      </Chip>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Monto Total</p>
                      <p
                        className={`text-xl font-bold ${
                          selectedEntry.type === "EXPENSE"
                            ? "text-red-600"
                            : selectedEntry.type === "INCOME"
                              ? "text-green-600"
                              : "text-blue-600"
                        }`}
                      >
                        {formatAmount(selectedEntry.amount, selectedEntry.type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-default-500 mb-2">
                        Cuentas Afectadas
                      </p>
                      <div className="space-y-2">
                        {selectedEntry.entryAccounts.map(
                          (entryAccount, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-3 bg-default-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {entryAccount.account.name}
                                </p>
                                <p className="text-sm text-default-500">
                                  {entryAccount.account.type}
                                </p>
                              </div>
                              <p className="font-bold text-primary">
                                {formatCurrency(entryAccount.amount)}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        disallowEmptySelection
                        label="Tipo"
                        selectedKeys={editForm.type ? [editForm.type] : []}
                        onSelectionChange={(keys) =>
                          setEditForm((prev) => ({
                            ...prev,
                            type: Array.from(keys)[0] as string,
                          }))
                        }
                      >
                        <SelectItem key="INCOME">💰 Ingresos</SelectItem>
                        <SelectItem key="EXPENSE">💸 Gastos</SelectItem>
                        <SelectItem key="TRANSFER">
                          🔄 Transferencias
                        </SelectItem>
                      </Select>

                      <Input
                        label="Fecha"
                        type="date"
                        value={editForm.date}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, date: value }))
                        }
                      />
                    </div>

                    <Input
                      label="Descripción"
                      value={editForm.description}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, description: value }))
                      }
                    />

                    <Select
                      disallowEmptySelection
                      label="Categoría"
                      selectedKeys={
                        editForm.categoryId ? [editForm.categoryId] : []
                      }
                      onSelectionChange={(keys) =>
                        setEditForm((prev) => ({
                          ...prev,
                          categoryId: Array.from(keys)[0] as string,
                        }))
                      }
                    >
                      {categories.map((category) => (
                        <SelectItem key={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Monto"
                      startContent={<span>$</span>}
                      type="number"
                      value={editForm.amount}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, amount: value }))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {!isEditMode ? (
              <>
                <Button
                  color="danger"
                  onPress={() =>
                    selectedEntry && confirmDelete(selectedEntry.id)
                  }
                >
                  Eliminar
                </Button>
                <Button color="primary" onPress={() => setIsEditMode(true)}>
                  Editar
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="default"
                  variant="light"
                  onPress={() => setIsEditMode(false)}
                >
                  Cancelar
                </Button>
                <Button color="success" onPress={updateEntry}>
                  Guardar Cambios
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} size="sm" onClose={cancelDelete}>
        <ModalContent>
          <ModalHeader>
            <span>Confirmar Eliminación</span>
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar esta entrada? Esta acción no
              se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={cancelDelete}>
              Cancelar
            </Button>
            <Button color="danger" onPress={deleteEntry}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
