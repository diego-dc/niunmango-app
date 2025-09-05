"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { useRequireAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";

type EntryType = "INCOME" | "EXPENSE" | "SAVINGS";
type Category = { id: string; name: string };
type Account = { id: string; name: string; type: string; balance: number };

interface AccountEntry {
  accountId: string;
  amount: number;
}

export default function NewEntryPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { get, post, loading } = useApi();
  const router = useRouter();

  // Form state
  const [type, setType] = useState<EntryType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountEntries, setAccountEntries] = useState<AccountEntry[]>([]);
  const [multipleAccounts, setMultipleAccounts] = useState(false);

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load categories and accounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, accountsData] = await Promise.all([
          get<Category[]>("/categories"),
          get<Account[]>("/accounts"),
        ]);

        setCategories(categoriesData);
        setAccounts(accountsData);

        // Initialize with first account if available
        if (accountsData.length > 0) {
          setAccountEntries([{ accountId: accountsData[0].id, amount: 0 }]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, get]);

  // Update account amounts when total amount changes
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (!multipleAccounts && accountEntries.length === 1) {
      setAccountEntries((prev) => [{ ...prev[0], amount: numAmount }]);
    }
  }, [amount, multipleAccounts, accountEntries.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !categoryId || accountEntries.length === 0) {
      return;
    }

    const totalAccountAmount = accountEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    if (Math.abs(totalAccountAmount - parseFloat(amount)) > 0.01) {
      alert("La suma de las cuentas debe ser igual al monto total");
      return;
    }

    try {
      await post("/entries", {
        type,
        amount: parseFloat(amount),
        description,
        categoryId,
        date: new Date(date),
        accountEntries,
      });

      router.push("/entries");
    } catch (error) {
      console.error("Error creating entry:", error);
      alert("Error al crear la entrada");
    }
  };

  const addAccount = () => {
    setAccountEntries((prev) => [
      ...prev,
      { accountId: accounts[0]?.id || "", amount: 0 },
    ]);
  };

  const removeAccount = (index: number) => {
    setAccountEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAccountEntry = (
    index: number,
    field: keyof AccountEntry,
    value: string | number
  ) => {
    setAccountEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const getTypeColor = () => {
    switch (type) {
      case "INCOME":
        return "success";
      case "EXPENSE":
        return "danger";
      case "SAVINGS":
        return "primary";
      default:
        return "default";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "INCOME":
        return "Ingreso";
      case "EXPENSE":
        return "Gasto";
      case "SAVINGS":
        return "Ahorro";
      default:
        return "";
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold">Nueva Entrada</h1>
            <Chip color={getTypeColor()} variant="flat">
              {getTypeLabel()}
            </Chip>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <Select
              label="Tipo de Entrada"
              placeholder="Selecciona el tipo"
              selectedKeys={[type]}
              onSelectionChange={(keys) =>
                setType(Array.from(keys)[0] as EntryType)
              }
              isRequired
            >
              <SelectItem key="EXPENSE">💸 Gasto</SelectItem>
              <SelectItem key="INCOME">💰 Ingreso</SelectItem>
              <SelectItem key="SAVINGS">🏦 Ahorro</SelectItem>
            </Select>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monto"
                placeholder="0.00"
                startContent="$"
                type="number"
                step="0.01"
                value={amount}
                onValueChange={setAmount}
                isRequired
              />
              <Input
                label="Fecha"
                type="date"
                value={date}
                onValueChange={setDate}
                isRequired
              />
            </div>

            {/* Description */}
            <Textarea
              label="Descripción"
              placeholder="Describe esta transacción..."
              value={description}
              onValueChange={setDescription}
              isRequired
            />

            {/* Category */}
            <Select
              label="Categoría"
              placeholder="Selecciona una categoría"
              selectedKeys={categoryId ? [categoryId] : []}
              onSelectionChange={(keys) =>
                setCategoryId(Array.from(keys)[0] as string)
              }
              isRequired
            >
              {categories.map((category) => (
                <SelectItem key={category.id}>{category.name}</SelectItem>
              ))}
            </Select>

            <Divider />

            {/* Accounts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cuentas Afectadas</h3>
                <Switch
                  size="sm"
                  isSelected={multipleAccounts}
                  onValueChange={setMultipleAccounts}
                >
                  Múltiples cuentas
                </Switch>
              </div>

              {accountEntries.map((entry, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <Select
                    label={`Cuenta ${index + 1}`}
                    placeholder="Selecciona cuenta"
                    className="flex-1"
                    selectedKeys={entry.accountId ? [entry.accountId] : []}
                    onSelectionChange={(keys) =>
                      updateAccountEntry(
                        index,
                        "accountId",
                        Array.from(keys)[0] as string
                      )
                    }
                    isRequired
                  >
                    {accounts.map((account) => (
                      <SelectItem key={account.id}>
                        {account.name} (${account.balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </Select>

                  {multipleAccounts && (
                    <Input
                      label="Monto"
                      placeholder="0.00"
                      startContent="$"
                      type="number"
                      step="0.01"
                      className="w-32"
                      value={entry.amount.toString()}
                      onValueChange={(value) =>
                        updateAccountEntry(
                          index,
                          "amount",
                          parseFloat(value) || 0
                        )
                      }
                      isRequired
                    />
                  )}

                  {multipleAccounts && accountEntries.length > 1 && (
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={() => removeAccount(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}

              {multipleAccounts && (
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  onClick={addAccount}
                  className="w-full"
                >
                  + Agregar Cuenta
                </Button>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                color="danger"
                variant="flat"
                onPress={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={loading}
                className="flex-1"
              >
                Guardar Entrada
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
