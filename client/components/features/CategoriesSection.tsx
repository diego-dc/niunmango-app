"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

import { Plus, Tag } from "@/components/icons";
import { useCategories } from "@/hooks/useCategories";

export function CategoriesSection() {
  const { categories, createCategory, deleteCategory, isCreating } =
    useCategories();
  const [newCategory, setNewCategory] = useState("");

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await createCategory(newCategory.trim());
      setNewCategory("");
      addToast({
        title: "Éxito",
        description: "Categoría creada exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo crear la categoría.",
        color: "danger",
      });
    }
  };

  const removeCategory = async (categoryId: string, categoryName: string) => {
    try {
      await deleteCategory(categoryId);
      addToast({
        title: "Éxito",
        description: `Categoría "${categoryName}" eliminada exitosamente.`,
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la categoría.",
        color: "danger",
      });
    }
  };

  return (
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
            className="flex-1"
            isDisabled={isCreating}
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <Button
            color="primary"
            isDisabled={!newCategory.trim()}
            isLoading={isCreating}
            startContent={<Plus className="w-4 h-4" />}
            onPress={addCategory}
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
                color="primary"
                variant="flat"
                onClose={() => removeCategory(category.id, category.name)}
              >
                {category.name}
              </Chip>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}
