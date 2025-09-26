import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { useApi } from "./useApi";

export type AccountType =
  | "SAVINGS"
  | "CHECKING"
  | "CREDIT_CARD"
  | "CASH"
  | "INVESTMENT"
  | "OTHER";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountData = {
  name: string;
  type: AccountType;
  balance?: number;
  isActive?: boolean;
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
        get<Account[]>("/accounts"),
        get<{ netWorth: number }>("/accounts/net-worth"),
        get<AccountDistribution[]>("/accounts/distribution"),
      ]);

      if (accountsData) {
        setAccounts(accountsData);
      }
      if (netWorthData) {
        setNetWorth(netWorthData.netWorth);
      }
      if (distributionData) {
        setAccountsDistribution(distributionData);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las cuentas.",
        color: "danger",
      });
      console.error("Error loading accounts:", error);
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
