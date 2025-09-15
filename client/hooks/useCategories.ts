import { useState, useEffect } from "react";
import { useApi } from "./useApi";

export type Category = {
  id: string;
  name: string;
  userId: string;
};

export function useCategories() {
  const { get, post, delete: deleteRequest, loading } = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await get<Category[]>("/categories");
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
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
      console.error("Error creating category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteRequest(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    createCategory,
    deleteCategory,
    loadCategories,
    isCreating: loading,
  };
}