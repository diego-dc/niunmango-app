import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { useApi } from "./useApi";

export type AccountType =
  | "CHECKING"
  | "CUENTA_RUT"
  | "CUENTA_VISTA"
  | "BILLETERA_DIGITAL"
  | "SAVINGS"
  | "INVESTMENT"
  | "CASH";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  isActive: boolean;
  isSavingsAccount: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountData = {
  name: string;
  type: AccountType;
  balance?: number;
  isActive?: boolean;
  isSavingsAccount?: boolean;
};

export type AccountDistribution = {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  type: string;
};

export function useAccounts() {
  const { get, post, put, delete: deleteRequest, loading } = useApi();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsDistribution, setAccountsDistribution] = useState<AccountDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [netWorth, setNetWorth] = useState(0);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const [accountsData, netWorthData, distributionData] = await Promise.all([
        get<Account[]>("/accounts").catch(() => []),
        get<{ netWorth: number }>("/accounts/net-worth").catch(() => ({ netWorth: 0 })),
        get<AccountDistribution[]>("/accounts/distribution").catch(() => []),
      ]);

      // Always set data, even if empty arrays/default values
      setAccounts(accountsData || []);
      setNetWorth(netWorthData?.netWorth || 0);
      setAccountsDistribution(distributionData || []);
    } catch (error) {
      // Only show error for actual API failures, not empty data
      console.error("Error loading accounts:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar las cuentas.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (accountData: CreateAccountData) => {
    try {
      const newAccount = await post<Account>("/accounts", accountData);

      if (newAccount) {
        setAccounts((prev) => [...prev, newAccount]);
        // Update net worth
        await loadAccounts();

        return newAccount;
      }
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  };

  const updateAccount = async (
    id: string,
    accountData: Partial<CreateAccountData>,
  ) => {
    try {
      const updatedAccount = await put<Account>(`/accounts/${id}`, accountData);

      if (updatedAccount) {
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === id ? updatedAccount : acc)),
        );
        // Update net worth
        await loadAccounts();

        return updatedAccount;
      }
    } catch (error) {
      console.error("Error updating account:", error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await deleteRequest(`/accounts/${id}`);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      // Update net worth
      await loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const toggleAccountStatus = async (id: string) => {
    const account = accounts.find((acc) => acc.id === id);

    if (account) {
      await updateAccount(id, { ...account, isActive: !account.isActive });
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return {
    accounts,
    accountsDistribution,
    netWorth,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccountStatus,
    loadAccounts,
    isCreating: loading,
  };
}
