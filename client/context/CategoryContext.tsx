"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { addToast } from "@heroui/toast";

import { useApi } from "@/hooks/useApi";

export type Category = {
  id: string;
  name: string;
  userId: string;
};

type CategoryContextType = {
  categories: Category[];
  isLoading: boolean;
  isCreating: boolean;
  createCategory: (name: string) => Promise<Category | undefined>;
  deleteCategory: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { get, post, delete: deleteRequest, loading } = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await get<Category[]>("/categories").catch(() => []);

      setCategories(data || []);
    } catch {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const newCategory = await post<Category>("/categories", { name });

      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);

        return newCategory;
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteRequest(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        isCreating: loading,
        createCategory,
        deleteCategory,
        loadCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);

  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }

  return context;
}
