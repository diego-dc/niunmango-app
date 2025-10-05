"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

import { Plus, Tag } from "@/components/icons";
import { useCategories } from "@/context/CategoryContext";
import { Icon } from "@iconify/react";

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
    if (categoryName === "Ahorro") {
      addToast({
        title: "Advertencia",
        description: "No se puede eliminar la categoría especial de ahorro.",
        color: "warning",
      });
      return;
    }

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
      <CardHeader className="flex flex-col gap-3">
        <div className="flex gap-2 w-full justify-start items-center">
          <Tag className="w-5 h-5 text-primary" />
          <p className="text-lg font-semibold">Categorías de Gastos</p>
        </div>
        <p className="text-small text-default-500">
          Administra las categorías para organizar tus entradas
        </p>
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
            categories.map((category) => {
              const isSavingsCategory = category.name === "Ahorro";

              return (
                <Chip
                  key={category.id}
                  color={isSavingsCategory ? "success" : "primary"}
                  variant="flat"
                  size="lg"
                  className="px-2"
                  startContent={
                    isSavingsCategory ? (
                      <Icon
                        icon="streamline-plump:piggy-bank-solid"
                        className="w-4 h-4 mx-1"
                      />
                    ) : (
                      <Tag className="w-4 h-4 mx-1" />
                    )
                  }
                  onClose={
                    isSavingsCategory
                      ? undefined
                      : () => removeCategory(category.id, category.name)
                  }
                >
                  {category.name}
                </Chip>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
}
