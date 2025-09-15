"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Plus, Trash, CreditCard } from "@/components/icons";
import { useAccounts, AccountType } from "@/hooks/useAccounts";
import { addToast } from "@heroui/toast";

export function AccountsSection() {
  const {
    accounts,
    createAccount,
    deleteAccount,
    toggleAccountStatus,
    isLoading,
    isCreating,
  } = useAccounts();
  const {
    isOpen: isNewAccountOpen,
    onOpen: onNewAccountOpen,
    onOpenChange: onNewAccountOpenChange,
  } = useDisclosure();

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CHECKING" as AccountType,
    balance: "0",
  });

  const accountTypes = [
    { key: "CHECKING", label: "Cuenta Corriente" },
    { key: "SAVINGS", label: "Ahorros" },
    { key: "CREDIT_CARD", label: "Tarjeta de Crédito" },
    { key: "CASH", label: "Efectivo" },
    { key: "INVESTMENT", label: "Inversión" },
    { key: "OTHER", label: "Otro" },
  ];

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return "success";
      case "CHECKING":
        return "primary";
      case "CREDIT_CARD":
        return "warning";
      case "CASH":
        return "secondary";
      case "INVESTMENT":
        return "default";
      default:
        return "default";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const accountType = accountTypes.find((t) => t.key === type);
    return accountType ? accountType.label : type;
  };

  const handleCreateAccount = async (onClose: () => void) => {
    if (!newAccount.name.trim()) return;

    try {
      await createAccount({
        name: newAccount.name,
        type: newAccount.type,
        balance: parseFloat(newAccount.balance) || 0,
      });
      setNewAccount({ name: "", type: "CHECKING", balance: "0" });
      onClose();
      addToast({
        title: "Éxito",
        description: "Cuenta creada exitosamente.",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al crear la cuenta.",
      });
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    try {
      await deleteAccount(id);
      addToast({
        title: "Éxito",
        description: `Cuenta "${name}" eliminada.`,
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al eliminar la cuenta.",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAccountStatus(id);
      addToast({
        title: "Éxito",
        description: "Estado de cuenta actualizado.",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Error al actualizar el estado.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <CreditCard className="w-5 h-5 text-warning" />
          <div className="flex flex-col flex-1">
            <p className="text-lg font-semibold">Cuentas y Fondos</p>
            <p className="text-small text-default-500">
              Administra tus cuentas bancarias, tarjetas y fondos
            </p>
          </div>
          <Button
            color="warning"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onNewAccountOpen}
          >
            Nueva Cuenta
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="lg" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Sin cuentas</p>
              <p>
                Agrega tu primera cuenta para empezar a gestionar tus finanzas
              </p>
            </div>
          ) : (
            <Table aria-label="Tabla de cuentas">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>BALANCE</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody items={accounts}>
                {(account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <p className="font-medium">{account.name}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getAccountTypeColor(account.type)}
                        variant="flat"
                        size="sm"
                      >
                        {getAccountTypeLabel(account.type)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          account.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${account.balance}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={account.isActive ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {account.isActive ? "Activa" : "Inactiva"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color={account.isActive ? "default" : "success"}
                          onPress={() => handleToggleStatus(account.id)}
                        >
                          {account.isActive ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash className="w-3 h-3" />}
                          onPress={() =>
                            handleDeleteAccount(account.id, account.name)
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* New Account Modal */}
      <Modal isOpen={isNewAccountOpen} onOpenChange={onNewAccountOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Crear Nueva Cuenta</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nombre de la cuenta"
                    placeholder="Ej: Cuenta Banco X"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                  />
                  <Select
                    label="Tipo de cuenta"
                    placeholder="Selecciona el tipo"
                    selectedKeys={[newAccount.type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as AccountType;
                      setNewAccount({ ...newAccount, type: selected });
                    }}
                  >
                    {accountTypes.map((type) => (
                      <SelectItem key={type.key}>{type.label}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    label="Balance inicial"
                    placeholder="0.00"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, balance: e.target.value })
                    }
                    startContent={
                      <span className="text-default-400 text-small">$</span>
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateAccount(onClose)}
                  isLoading={isCreating}
                  isDisabled={!newAccount.name.trim()}
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
