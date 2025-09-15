import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { Category } from "./useCategories";

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
  category: { name: string };
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
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const [budgetsData, currentBudgetData] = await Promise.all([
        get<Budget[]>("/budgets"),
        get<Budget>("/budgets/current").catch(() => null),
      ]);

      if (budgetsData) {
        setBudgets(budgetsData);
      }
      if (currentBudgetData) {
        setCurrentBudget(currentBudgetData);
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
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
      console.error("Error creating budget:", error);
      throw error;
    }
  };

  const updateBudget = async (id: string, budgetData: Partial<CreateBudgetData>) => {
    try {
      const updatedBudget = await put<Budget>(`/budgets/${id}`, budgetData);
      if (updatedBudget) {
        setBudgets((prev) => prev.map((budget) => budget.id === id ? updatedBudget : budget));
        if (currentBudget && currentBudget.id === id) {
          setCurrentBudget(updatedBudget);
        }
        return updatedBudget;
      }
    } catch (error) {
      console.error("Error updating budget:", error);
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
      console.error("Error deleting budget:", error);
      throw error;
    }
  };

  const addBudgetItem = async (budgetId: string, itemData: CreateBudgetItemData) => {
    try {
      const newItem = await post<BudgetItem>(`/budgets/${budgetId}/items`, itemData);
      if (newItem) {
        // Reload budgets to get updated totals
        await loadBudgets();
        return newItem;
      }
    } catch (error) {
      console.error("Error adding budget item:", error);
      throw error;
    }
  };

  const updateBudgetItem = async (budgetId: string, itemId: string, itemData: Partial<CreateBudgetItemData>) => {
    try {
      const updatedItem = await put<BudgetItem>(`/budgets/${budgetId}/items/${itemId}`, itemData);
      if (updatedItem) {
        // Reload budgets to get updated totals
        await loadBudgets();
        return updatedItem;
      }
    } catch (error) {
      console.error("Error updating budget item:", error);
      throw error;
    }
  };

  const deleteBudgetItem = async (budgetId: string, itemId: string) => {
    try {
      await deleteRequest(`/budgets/${budgetId}/items/${itemId}`);
      // Reload budgets to get updated totals
      await loadBudgets();
    } catch (error) {
      console.error("Error deleting budget item:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  return {
    budgets,
    currentBudget,
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