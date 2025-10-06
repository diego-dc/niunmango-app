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
      const entries = await get<Entry[]>("/entries/recent?limit=5").catch(
        () => [],
      );

      // Always set data, even if empty array
      setRecentEntries(entries || []);
    } catch (error) {
      // Only show error for actual API failures, not empty data
      addToast({
        title: "Error",
        description: "No se pudieron cargar las entradas recientes.",
        color: "danger",
      });
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
