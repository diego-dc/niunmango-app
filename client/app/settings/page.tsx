"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Plus, Settings, Tag } from "@/components/icons";
import { useCategories } from "@/hooks/useCategories";
import { useRequireAuth } from "@/hooks/useAuth";
import { addToast } from "@heroui/toast";
import { BudgetsSection } from "@/components/BudgetsSection";
import { AccountsSection } from "@/components/AccountsSection";

export default function SettingsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { categories, isLoading, createCategory, deleteCategory, isCreating } = useCategories();
  const [newCategory, setNewCategory] = useState("");

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await createCategory(newCategory.trim());
      setNewCategory("");
      addToast({
        title: "Éxito",
        description: "Categoría creada exitosamente.",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al crear la categoría.",
      });
    }
  };

  const removeCategory = async (categoryId: string, categoryName: string) => {
    try {
      await deleteCategory(categoryId);
      addToast({
        title: "Éxito",
        description: `Categoría "${categoryName}" eliminada.`,
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al eliminar la categoría.",
      });
    }
  };

  if (authLoading || isLoading) {
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
      <Card>
        <CardHeader className="flex gap-3">
          <Tag className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Categorías de Gastos</p>
            <p className="text-small text-default-500">
              Administra las categorías para organizar tus entradas
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-3">
            <Input
              placeholder="Nueva categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="flex-1"
              isDisabled={isCreating}
            />
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={addCategory}
              isLoading={isCreating}
              isDisabled={!newCategory.trim()}
            >
              Agregar
            </Button>
          </div>

          {/* Categories list */}
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-default-500 text-center w-full py-4">
                No hay categorías creadas. Agrega tu primera categoría.
              </p>
            ) : (
              categories.map((category) => (
                <Chip
                  key={category.id}
                  onClose={() => removeCategory(category.id, category.name)}
                  variant="flat"
                  color="primary"
                >
                  {category.name}
                </Chip>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Budgets Section */}
      <BudgetsSection />

      {/* Accounts Section */}
      <AccountsSection />
    </div>
  );
}