"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Plus, Trash, Target } from "@/components/icons";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { addToast } from "@heroui/toast";

export function BudgetsSection() {
  const {
    budgets,
    createBudget,
    deleteBudget,
    addBudgetItem,
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
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al crear el presupuesto.",
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
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al agregar categoría al presupuesto.",
      });
    }
  };

  const handleDeleteBudget = async (id: string, name: string) => {
    try {
      await deleteBudget(id);
      addToast({
        title: "Éxito",
        description: `Presupuesto "${name}" eliminado.`,
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al eliminar el presupuesto.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <Target className="w-5 h-5 text-success" />
          <div className="flex flex-col flex-1">
            <p className="text-lg font-semibold">Presupuestos</p>
            <p className="text-small text-default-500">
              Configura y administra tus presupuestos mensuales
            </p>
          </div>
          <Button
            color="success"
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
              {budgets.map((budget) => (
                <Card key={budget.id} className="border">
                  <CardHeader>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h4 className="font-semibold">{budget.name}</h4>
                        <p className="text-small text-default-500">
                          {new Date(budget.startDate).toLocaleDateString()} -{" "}
                          {new Date(budget.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            setSelectedBudgetId(budget.id);
                            onAddItemOpen();
                          }}
                        >
                          + Categoría
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash className="w-3 h-3" />}
                          onPress={() =>
                            handleDeleteBudget(budget.id, budget.name)
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-small font-medium">
                          Progreso Total
                        </span>
                        <span className="text-small">
                          ${budget.totalSpent.toFixed(2)} / $
                          {budget.totalBudgeted.toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={budget.overallPercentage}
                        color={
                          budget.overallPercentage > 100 ? "danger" : "success"
                        }
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
                                ${item.spent.toFixed(2)} / $
                                {item.budgetedAmount.toFixed(2)}
                              </span>
                              <Chip
                                size="sm"
                                color={
                                  item.percentage > 100 ? "danger" : "success"
                                }
                                variant="flat"
                              >
                                {item.percentage.toFixed(0)}%
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* New Budget Modal */}
      <Modal isOpen={isNewBudgetOpen} onOpenChange={onNewBudgetOpenChange}>
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
                    type="date"
                    label="Fecha de inicio"
                    value={newBudget.startDate}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, startDate: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    label="Fecha de fin"
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
                  onPress={() => handleCreateBudget(onClose)}
                  isLoading={isCreating}
                  isDisabled={
                    !newBudget.name.trim() ||
                    !newBudget.startDate ||
                    !newBudget.endDate
                  }
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Budget Item Modal */}
      <Modal isOpen={isAddItemOpen} onOpenChange={onAddItemOpenChange}>
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
                    type="number"
                    label="Monto presupuestado"
                    placeholder="0.00"
                    value={newBudgetItem.budgetedAmount}
                    onChange={(e) =>
                      setNewBudgetItem({
                        ...newBudgetItem,
                        budgetedAmount: e.target.value,
                      })
                    }
                    startContent={
                      <span className="text-default-400 text-small">$</span>
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
                  onPress={() => handleAddBudgetItem(onClose)}
                  isLoading={isCreating}
                  isDisabled={
                    !newBudgetItem.categoryId || !newBudgetItem.budgetedAmount
                  }
                >
                  Agregar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
