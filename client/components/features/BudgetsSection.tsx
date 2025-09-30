"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import { Select, SelectItem } from "@heroui/select";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { Plus, Trash, Target, Edit3 } from "@/components/icons";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

export function BudgetsSection() {
  const {
    budgets,
    createBudget,
    deleteBudget,
    addBudgetItem,
    updateBudgetItem,
    isLoading,
    isCreating,
  } = useBudgets();
  const { categories } = useCategories();
  const {
    isOpen: isNewBudgetOpen,
    onOpen: onNewBudgetOpen,
    onOpenChange: onNewBudgetOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddItemOpen,
    onOpen: onAddItemOpen,
    onOpenChange: onAddItemOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditItemOpen,
    onOpen: onEditItemOpen,
    onOpenChange: onEditItemOpenChange,
  } = useDisclosure();

  const [newBudget, setNewBudget] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [newBudgetItem, setNewBudgetItem] = useState({
    categoryId: "",
    budgetedAmount: "",
  });
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [budgetToDelete, setBudgetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    budgetId: string;
    categoryName: string;
    currentAmount: number;
  } | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const budgetsPerPage = 5;

  const handleCreateBudget = async (onClose: () => void) => {
    if (!newBudget.name.trim() || !newBudget.startDate || !newBudget.endDate)
      return;

    try {
      await createBudget(newBudget);
      setNewBudget({ name: "", startDate: "", endDate: "" });
      onClose();
      addToast({
        title: "Éxito",
        description: "Presupuesto creado exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo crear el presupuesto.",
        color: "danger",
      });
    }
  };

  const handleAddBudgetItem = async (onClose: () => void) => {
    if (
      !newBudgetItem.categoryId ||
      !newBudgetItem.budgetedAmount ||
      !selectedBudgetId
    )
      return;

    try {
      await addBudgetItem(selectedBudgetId, {
        categoryId: newBudgetItem.categoryId,
        budgetedAmount: parseFloat(newBudgetItem.budgetedAmount),
      });
      setNewBudgetItem({ categoryId: "", budgetedAmount: "" });
      onClose();
      addToast({
        title: "Éxito",
        description: "Categoría agregada al presupuesto.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo agregar la categoría al presupuesto.",
        color: "danger",
      });
    }
  };

  const confirmDeleteBudget = (id: string, name: string) => {
    setBudgetToDelete({ id, name });
    onDeleteConfirmOpen();
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      await deleteBudget(budgetToDelete.id);
      addToast({
        title: "Éxito",
        description: `Presupuesto "${budgetToDelete.name}" eliminado exitosamente.`,
        color: "success",
      });
      setBudgetToDelete(null);
      onDeleteConfirmOpenChange();
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto.",
        color: "danger",
      });
    }
  };

  const cancelDeleteBudget = () => {
    setBudgetToDelete(null);
    onDeleteConfirmOpenChange();
  };

  const handleEditBudgetItem = (item: any, budgetId: string) => {
    setEditingItem({
      id: item.id,
      budgetId,
      categoryName: item.category.name,
      currentAmount: item.budgetedAmount,
    });
    setEditAmount(item.budgetedAmount.toString());
    onEditItemOpen();
  };

  const handleUpdateBudgetItem = async (onClose: () => void) => {
    if (!editingItem || !editAmount) return;

    try {
      await updateBudgetItem(editingItem.budgetId, editingItem.id, {
        budgetedAmount: parseFloat(editAmount),
      });
      setEditingItem(null);
      setEditAmount("");
      onClose();
      addToast({
        title: "Éxito",
        description: "Monto actualizado exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo actualizar el monto.",
        color: "danger",
      });
    }
  };

  const cancelEditItem = () => {
    setEditingItem(null);
    setEditAmount("");
    onEditItemOpenChange();
  };

  // Pagination logic
  const totalPages = Math.ceil(budgets.length / budgetsPerPage);
  const startIndex = (currentPage - 1) * budgetsPerPage;
  const endIndex = startIndex + budgetsPerPage;
  const currentBudgets = budgets.slice(startIndex, endIndex);

  // Reset to first page when budgets change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [budgets.length, currentPage, totalPages]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 justify-start">
          <div className="flex gap-2 w-full items-center justify-start">
            <Target className="w-5 h-5 text-primary" />
            <p className="text-lg font-semibold">Presupuestos</p>
          </div>
          <p className="text-small text-default-500">
            Configura y administra tus presupuestos mensuales
          </p>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onNewBudgetOpen}
          >
            Nuevo Presupuesto
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="lg" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Sin presupuestos</p>
              <p>Crea tu primer presupuesto para controlar tus gastos</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Accordion variant="splitted">
                {currentBudgets.map((budget) => (
                <AccordionItem
                  key={budget.id}
                  title={
                    <div className="flex flex-col items-start">
                      <h4 className="font-semibold">{budget.name}</h4>
                      <p className="text-small text-default-500">
                        {new Date(budget.startDate).toLocaleDateString()} -{" "}
                        {new Date(budget.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        color="secondary"
                        size="sm"
                        variant="flat"
                        onPress={() => {
                          setSelectedBudgetId(budget.id);
                          onAddItemOpen();
                        }}
                      >
                        + Categoría
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        startContent={<Trash className="w-3 h-3" />}
                        variant="flat"
                        onPress={() =>
                          confirmDeleteBudget(budget.id, budget.name)
                        }
                      >
                        Eliminar
                      </Button>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-small font-medium">
                          Progreso Total
                        </span>
                        <span className="text-small">
                          {formatCurrency(budget.totalSpent)} /{" "}
                          {formatCurrency(budget.totalBudgeted)}
                        </span>
                      </div>
                      <Progress
                        color={
                          budget.overallPercentage > 100 ? "danger" : "success"
                        }
                        value={budget.overallPercentage}
                      />
                    </div>

                    {budget.budgetItems.length > 0 && (
                      <div className="space-y-2">
                        {budget.budgetItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-2 bg-default-50 rounded"
                          >
                            <span className="font-medium">
                              {item.category.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-small">
                                {formatCurrency(item.spent)} /{" "}
                                {formatCurrency(item.budgetedAmount)}
                              </span>
                              <Chip
                                color={
                                  item.percentage > 100 ? "danger" : "success"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {formatPercentage(item.percentage)}
                              </Chip>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditBudgetItem(item, budget.id)}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionItem>
                ))}
              </Accordion>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    showShadow
                    color="primary"
                  />
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* New Budget Modal */}
      <Modal
        isDismissable={false}
        isOpen={isNewBudgetOpen}
        onOpenChange={onNewBudgetOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Crear Nuevo Presupuesto</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nombre del presupuesto"
                    placeholder="Ej: Presupuesto Enero 2024"
                    value={newBudget.name}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, name: e.target.value })
                    }
                  />
                  <Input
                    label="Fecha de inicio"
                    type="date"
                    value={newBudget.startDate}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, startDate: e.target.value })
                    }
                  />
                  <Input
                    label="Fecha de fin"
                    type="date"
                    value={newBudget.endDate}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, endDate: e.target.value })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !newBudget.name.trim() ||
                    !newBudget.startDate ||
                    !newBudget.endDate
                  }
                  isLoading={isCreating}
                  onPress={() => handleCreateBudget(onClose)}
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Budget Item Modal */}
      <Modal
        isDismissable={false}
        isOpen={isAddItemOpen}
        onOpenChange={onAddItemOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Agregar Categoría al Presupuesto</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Categoría"
                    placeholder="Selecciona una categoría"
                    selectedKeys={
                      newBudgetItem.categoryId ? [newBudgetItem.categoryId] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setNewBudgetItem({
                        ...newBudgetItem,
                        categoryId: selected,
                      });
                    }}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id}>{category.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Monto presupuestado"
                    placeholder="0.00"
                    startContent={
                      <span className="text-default-400 text-small">$</span>
                    }
                    type="number"
                    value={newBudgetItem.budgetedAmount}
                    onChange={(e) =>
                      setNewBudgetItem({
                        ...newBudgetItem,
                        budgetedAmount: e.target.value,
                      })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !newBudgetItem.categoryId || !newBudgetItem.budgetedAmount
                  }
                  isLoading={isCreating}
                  onPress={() => handleAddBudgetItem(onClose)}
                >
                  Agregar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Budget Item Modal */}
      <Modal
        isDismissable={false}
        isOpen={isEditItemOpen}
        onOpenChange={onEditItemOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Editar Monto de Categoría</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-small text-default-500 mb-2">Categoría:</p>
                    <p className="font-medium">{editingItem?.categoryName}</p>
                  </div>
                  <Input
                    label="Nuevo monto presupuestado"
                    placeholder="0.00"
                    startContent={
                      <span className="text-default-400 text-small">$</span>
                    }
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={cancelEditItem}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={!editAmount || parseFloat(editAmount) <= 0}
                  isLoading={isCreating}
                  onPress={() => handleUpdateBudgetItem(onClose)}
                >
                  Actualizar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        size="sm"
        onOpenChange={onDeleteConfirmOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <span>Confirmar Eliminación</span>
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar el presupuesto &quot;
              {budgetToDelete?.name}&quot;? Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={cancelDeleteBudget}
            >
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDeleteBudget}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
