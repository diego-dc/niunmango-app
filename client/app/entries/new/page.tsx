"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";

import { useRequireAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import {
  EntryType,
  getTypeIcon,
  getChipColor,
  getTypeLabel
} from "@/utils/entryHelpers";
import { getCurrentDateString } from "@/utils/dateHelpers";

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
  const searchParams = useSearchParams();

  // Get initial type from URL params, default to EXPENSE
  const initialType = (searchParams.get("type") as EntryType) || "EXPENSE";

  // Form state
  const [type, setType] = useState<EntryType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getCurrentDateString());
  const [selectedAccountId, setSelectedAccountId] = useState("");
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

        // Initialize accounts based on type
        if (type === "TRANSFER" && accountsData.length >= 2) {
          // For transfers, initialize with 2 accounts
          setMultipleAccounts(true);
          const amountNum = parseFloat(amount) || 0;

          setAccountEntries([
            { accountId: accountsData[0].id, amount: amountNum },
            { accountId: accountsData[1].id, amount: -amountNum },
          ]);
        } else if (accountsData.length > 0) {
          // For regular entries, initialize with first account
          setSelectedAccountId(accountsData[0].id);
        }
      } catch {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          color: "danger",
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, get]);

  // Initialize transfer accounts when accounts load and type is TRANSFER
  useEffect(() => {
    if (
      type === "TRANSFER" &&
      accounts.length >= 2 &&
      accountEntries.length !== 2
    ) {
      setMultipleAccounts(true);
      const amountNum = parseFloat(amount) || 0;

      setAccountEntries([
        { accountId: accounts[0].id, amount: -amountNum }, // Origen: sale dinero
        { accountId: accounts[1].id, amount: amountNum }, // Destino: entra dinero
      ]);
    }
  }, [type, accounts, amount, accountEntries.length]);

  // Handle switching between single and multiple accounts
  useEffect(() => {
    if (multipleAccounts) {
      // Switch to multiple accounts mode
      if (selectedAccountId) {
        setAccountEntries([
          { accountId: selectedAccountId, amount: parseFloat(amount) || 0 },
        ]);
      }
    } else {
      // Switch to single account mode
      setAccountEntries([]);
    }
  }, [multipleAccounts, selectedAccountId, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || (type !== "TRANSFER" && !categoryId)) {
      return;
    }

    // Validate accounts based on entry type
    if (type === "TRANSFER") {
      // Transfers must have exactly 2 accounts
      if (accountEntries.length !== 2) {
        addToast({
          title: "Error",
          description: "Las transferencias deben tener exactamente 2 cuentas.",
          color: "danger",
        });

        return;
      }

      const totalAccountAmount = accountEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      );

      if (Math.abs(totalAccountAmount) > 0.01) {
        addToast({
          title: "Error",
          description:
            "Para transferencias, la suma de los montos debe ser cero (uno negativo, uno positivo).",
          color: "danger",
        });

        return;
      }
    } else {
      // Regular entries validation
      if (multipleAccounts) {
        if (accountEntries.length === 0) {
          addToast({
            title: "Error",
            description: "Debe seleccionar al menos una cuenta.",
            color: "danger",
          });

          return;
        }

        const totalAccountAmount = accountEntries.reduce(
          (sum, entry) => sum + entry.amount,
          0,
        );

        if (Math.abs(totalAccountAmount - parseFloat(amount)) > 0.01) {
          addToast({
            title: "Error de validación",
            description: "Los montos no coinciden con el total.",
            color: "warning",
          });

          return;
        }
      } else {
        if (!selectedAccountId) {
          addToast({
            title: "Error",
            description: "Debe seleccionar una cuenta.",
            color: "danger",
          });

          return;
        }
      }
    }

    try {
      const finalAccountEntries =
        type === "TRANSFER" || multipleAccounts
          ? accountEntries
          : [{ accountId: selectedAccountId, amount: parseFloat(amount) }];

      await post("/entries", {
        type,
        amount: parseFloat(amount),
        description,
        categoryId: categoryId || null,
        date: new Date(date),
        accountEntries: finalAccountEntries,
      });
      addToast({
        title: "Éxito",
        description: "Entrada creada exitosamente.",
        color: "success",
      });

      router.push("/entries");
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo crear la entrada. Intenta nuevamente.",
        color: "danger",
      });
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
    value: string | number,
  ) => {
    setAccountEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };


  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold">Nueva Entrada</h1>
            <Chip color={getChipColor(type)} variant="flat">
              {getTypeLabel(type)}
            </Chip>
          </div>
        </CardHeader>

        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Type Selection */}
            <Select
              isRequired
              label="Tipo de Entrada"
              placeholder="Selecciona el tipo"
              selectedKeys={[type]}
              onSelectionChange={(keys) => {
                const newType = Array.from(keys)[0] as EntryType;

                setType(newType);

                // Auto-enable multiple accounts for transfers
                if (newType === "TRANSFER") {
                  setMultipleAccounts(true);
                  // Initialize with 2 accounts for transfers
                  if (accounts.length >= 2) {
                    const amountNum = parseFloat(amount) || 0;

                    setAccountEntries([
                      { accountId: accounts[0].id, amount: -amountNum }, // Origen: sale dinero
                      { accountId: accounts[1].id, amount: amountNum }, // Destino: entra dinero
                    ]);
                  } else if (accounts.length >= 1) {
                    // If only one account available, add first one and empty second
                    const amountNum = parseFloat(amount) || 0;

                    setAccountEntries([
                      { accountId: accounts[0].id, amount: -amountNum }, // Origen: sale dinero
                      { accountId: "", amount: amountNum }, // Destino: entra dinero
                    ]);
                  } else {
                    // No accounts available, create empty entries
                    setAccountEntries([
                      { accountId: "", amount: 0 },
                      { accountId: "", amount: 0 },
                    ]);
                  }
                } else {
                  // Reset to single account mode for other types
                  setMultipleAccounts(false);
                  setAccountEntries([]);
                }
              }}
            >
              <SelectItem
                key="EXPENSE"
                startContent={<Icon icon={getTypeIcon("EXPENSE")} width={16} />}
              >
                Gasto
              </SelectItem>
              <SelectItem
                key="INCOME"
                startContent={<Icon icon={getTypeIcon("INCOME")} width={16} />}
              >
                Ingreso
              </SelectItem>
              <SelectItem
                key="TRANSFER"
                startContent={<Icon icon={getTypeIcon("TRANSFER")} width={16} />}
              >
                Transferencia
              </SelectItem>
            </Select>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                label="Monto"
                placeholder="0.00"
                startContent="$"
                step="0.01"
                type="number"
                value={amount}
                onValueChange={(value) => {
                  setAmount(value);
                  // For transfers, auto-update account entries with opposite amounts
                  if (type === "TRANSFER" && accountEntries.length === 2) {
                    const amountNum = parseFloat(value) || 0;

                    setAccountEntries([
                      { ...accountEntries[0], amount: -amountNum }, // Origen: sale dinero (negativo)
                      { ...accountEntries[1], amount: amountNum }, // Destino: entra dinero (positivo)
                    ]);
                  }
                }}
              />
              <Input
                isRequired
                label="Fecha"
                type="date"
                value={date}
                onValueChange={setDate}
              />
            </div>

            {/* Description */}
            <Textarea
              label="Descripción"
              placeholder="Describe esta transacción..."
              value={description}
              onValueChange={setDescription}
            />

            {/* Category - Not needed for transfers */}
            {type !== "TRANSFER" && (
              <Select
                isRequired
                label="Categoría"
                placeholder="Selecciona una categoría"
                selectedKeys={categoryId ? [categoryId] : []}
                onSelectionChange={(keys) =>
                  setCategoryId(Array.from(keys)[0] as string)
                }
              >
                {categories.map((category) => (
                  <SelectItem key={category.id}>{category.name}</SelectItem>
                ))}
              </Select>
            )}

            <Divider />

            {/* Accounts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {type === "TRANSFER"
                    ? "Cuentas (Origen y Destino)"
                    : "Cuenta Afectada"}
                </h3>
                {type !== "TRANSFER" && (
                  <Switch
                    isSelected={multipleAccounts}
                    size="sm"
                    onValueChange={setMultipleAccounts}
                  >
                    Múltiples cuentas
                  </Switch>
                )}
              </div>

              {!multipleAccounts && type !== "TRANSFER" ? (
                // Single account mode
                <Select
                  isRequired
                  label="Cuenta"
                  placeholder="Selecciona una cuenta"
                  selectedKeys={selectedAccountId ? [selectedAccountId] : []}
                  onSelectionChange={(keys) =>
                    setSelectedAccountId(Array.from(keys)[0] as string)
                  }
                >
                  {accounts.map((account) => (
                    <SelectItem key={account.id}>{account.name}</SelectItem>
                  ))}
                </Select>
              ) : (
                // Multiple accounts mode or Transfer mode
                <>
                  {type === "TRANSFER" && (
                    <p className="text-sm text-gray-500">
                      Para transferencias: La cuenta origen se descuenta el
                      monto (negativo) y la cuenta destino se suma el monto
                      (positivo).
                    </p>
                  )}
                  {accountEntries.map((entry, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <Select
                        isRequired
                        className="flex-1"
                        label={
                          type === "TRANSFER"
                            ? index === 0
                              ? "Cuenta Origen"
                              : "Cuenta Destino"
                            : `Cuenta ${index + 1}`
                        }
                        placeholder="Selecciona cuenta"
                        selectedKeys={entry.accountId ? [entry.accountId] : []}
                        onSelectionChange={(keys) =>
                          updateAccountEntry(
                            index,
                            "accountId",
                            Array.from(keys)[0] as string,
                          )
                        }
                      >
                        {accounts.map((account) => (
                          <SelectItem key={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        isRequired
                        className="w-32"
                        isReadOnly={type === "TRANSFER"}
                        label="Monto"
                        placeholder="0.00"
                        startContent="$"
                        step="0.01"
                        type="number"
                        value={entry.amount.toString()}
                        onValueChange={(value) =>
                          type === "TRANSFER"
                            ? undefined
                            : updateAccountEntry(
                                index,
                                "amount",
                                parseFloat(value) || 0,
                              )
                        }
                      />

                      {accountEntries.length > 1 && type !== "TRANSFER" && (
                        <Button
                          color="danger"
                          size="sm"
                          variant="flat"
                          onPress={() => removeAccount(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}

                  {type !== "TRANSFER" && (
                    <Button
                      className="w-full"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={addAccount}
                    >
                      + Agregar Cuenta
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                color="danger"
                variant="flat"
                onPress={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                color="primary"
                isLoading={loading}
                type="submit"
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
