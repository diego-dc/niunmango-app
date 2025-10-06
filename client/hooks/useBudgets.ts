import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { useApi } from "./useApi";

export type Budget = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  userId: string;
  totalBudgeted: number;
  totalSpent: number;
  overallPercentage: number;
  budgetItems: BudgetItem[];
};

export type BudgetItem = {
  id: string;
  budgetId: string;
  categoryId: string;
  budgetedAmount: number;
  category: {
    id: string;
    name: string;
    userId: string;
    isSpecial?: boolean;
    specialType?: string;
  };
  spent: number;
  percentage: number;
};

export type CreateBudgetData = {
  name: string;
  startDate: string;
  endDate: string;
};

export type CreateBudgetItemData = {
  categoryId: string;
  budgetedAmount: number;
};

export function useBudgets() {
  const { get, post, put, delete: deleteRequest, loading } = useApi();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const [budgetsData, currentBudgetData, activeBudgetsData] =
        await Promise.all([
          get<Budget[]>("/budgets").catch(() => []),
          get<Budget>("/budgets/current").catch(() => null),
          get<Budget[]>("/budgets/active").catch(() => []),
        ]);

      // Always set data, even if empty arrays/null
      setBudgets(budgetsData || []);
      setCurrentBudget(currentBudgetData);
      setActiveBudgets(activeBudgetsData || []);
    } catch {
      // Only show error for actual API failures, not empty data
      addToast({
        title: "Error",
        description: "No se pudieron cargar los presupuestos.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBudget = async (budgetData: CreateBudgetData) => {
    try {
      const newBudget = await post<Budget>("/budgets", budgetData);

      if (newBudget) {
        setBudgets((prev) => [...prev, newBudget]);

        return newBudget;
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo crear el presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  const updateBudget = async (
    id: string,
    budgetData: Partial<CreateBudgetData>,
  ) => {
    try {
      const updatedBudget = await put<Budget>(`/budgets/${id}`, budgetData);

      if (updatedBudget) {
        setBudgets((prev) =>
          prev.map((budget) => (budget.id === id ? updatedBudget : budget)),
        );
        if (currentBudget && currentBudget.id === id) {
          setCurrentBudget(updatedBudget);
        }

        return updatedBudget;
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await deleteRequest(`/budgets/${id}`);
      setBudgets((prev) => prev.filter((budget) => budget.id !== id));
      if (currentBudget && currentBudget.id === id) {
        setCurrentBudget(null);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  const addBudgetItem = async (
    budgetId: string,
    itemData: CreateBudgetItemData,
  ) => {
    try {
      const newItem = await post<BudgetItem>(`/budget-items`, {
        ...itemData,
        budgetId,
      });

      if (newItem) {
        // Reload budgets to get updated totals
        await loadBudgets();

        return newItem;
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo agregar la categoría al presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  const updateBudgetItem = async (
    _budgetId: string,
    itemId: string,
    itemData: Partial<CreateBudgetItemData>,
  ) => {
    try {
      const updatedItem = await put<BudgetItem>(
        `/budget-items/${itemId}`,
        itemData,
      );

      if (updatedItem) {
        // Reload budgets to get updated totals
        await loadBudgets();

        return updatedItem;
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo actualizar la categoría del presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  const deleteBudgetItem = async (_budgetId: string, itemId: string) => {
    try {
      await deleteRequest(`/budget-items/${itemId}`);
      // Reload budgets to get updated totals
      await loadBudgets();
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la categoría del presupuesto.",
        color: "danger",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  return {
    budgets,
    currentBudget,
    activeBudgets,
    isLoading,
    createBudget,
    updateBudget,
    deleteBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    loadBudgets,
    isCreating: loading,
  };
}
