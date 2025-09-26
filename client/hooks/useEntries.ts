import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { useApi } from "./useApi";

type EntryType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface Entry {
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

export function useEntries() {
  const { get, loading } = useApi();
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecentEntries = async () => {
    try {
      setIsLoading(true);
      const entries = await get<Entry[]>("/entries/recent?limit=5");

      if (entries) {
        setRecentEntries(entries);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las entradas recientes.",
        color: "danger",
      });
      console.error("Error loading recent entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentEntries();
  }, []);

  return {
    recentEntries,
    isLoading,
    loadRecentEntries,
    isLoadingApi: loading,
  };
}