"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
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
import { addToast } from "@heroui/toast";

import { Plus, Trash } from "@/components/icons";
import { useAccounts, AccountType } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/formatters";
import { Icon } from "@iconify/react";

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
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();
  const {
    isOpen: isToggleConfirmOpen,
    onOpen: onToggleConfirmOpen,
    onOpenChange: onToggleConfirmOpenChange,
  } = useDisclosure();

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CHECKING" as AccountType,
    balance: "0",
    isSavingsAccount: false,
  });
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [accountToToggle, setAccountToToggle] = useState<{
    id: string;
    name: string;
    isActive: boolean;
  } | null>(null);

  const accountTypes = [
    { key: "CHECKING", label: "Cuenta Corriente" },
    { key: "CUENTA_RUT", label: "Cuenta Rut" },
    { key: "CUENTA_VISTA", label: "Cuenta Vista" },
    { key: "BILLETERA_DIGITAL", label: "Billetera Digital" },
    { key: "SAVINGS", label: "Cuenta de Ahorro" },
    { key: "INVESTMENT", label: "Cuenta de Inversión" },
    { key: "CASH", label: "Efectivo" },
  ];

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return "success";
      case "CHECKING":
      case "CUENTA_RUT":
      case "CUENTA_VISTA":
        return "primary";
      case "BILLETERA_DIGITAL":
        return "secondary";
      case "INVESTMENT":
        return "warning";
      case "CASH":
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
        isSavingsAccount: newAccount.isSavingsAccount,
      });
      setNewAccount({ name: "", type: "CHECKING", balance: "0", isSavingsAccount: false });
      onClose();
      addToast({
        title: "Éxito",
        description: "Cuenta creada exitosamente.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo crear la cuenta.",
        color: "danger",
      });
    }
  };

  const confirmDeleteAccount = (id: string, name: string) => {
    setAccountToDelete({ id, name });
    onDeleteConfirmOpen();
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccount(accountToDelete.id);
      addToast({
        title: "Éxito",
        description: `Cuenta "${accountToDelete.name}" eliminada exitosamente.`,
        color: "success",
      });
      setAccountToDelete(null);
      onDeleteConfirmOpenChange();
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la cuenta.",
        color: "danger",
      });
    }
  };

  const cancelDeleteAccount = () => {
    setAccountToDelete(null);
    onDeleteConfirmOpenChange();
  };

  const confirmToggleStatus = (id: string, name: string, isActive: boolean) => {
    setAccountToToggle({ id, name, isActive });
    onToggleConfirmOpen();
  };

  const handleToggleStatus = async () => {
    if (!accountToToggle) return;

    try {
      await toggleAccountStatus(accountToToggle.id);
      addToast({
        title: "Éxito",
        description: "Estado de cuenta actualizado exitosamente.",
        color: "success",
      });
      setAccountToToggle(null);
      onToggleConfirmOpenChange();
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cuenta.",
        color: "danger",
      });
    }
  };

  const cancelToggleStatus = () => {
    setAccountToToggle(null);
    onToggleConfirmOpenChange();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex gap-2 items-center justify-start w-full">
            <Icon
              icon="majesticons:creditcard"
              className="w-5 h-5 text-primary"
            />
            <p className="text-lg font-semibold">Cuentas y Fondos</p>
          </div>
          <p className="text-small text-default-500">
            Administra tus cuentas bancarias, tarjetas y fondos
          </p>
          <Button
            color="primary"
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
            <div className="text-center flex flex-col items-center py-8 text-default-500">
              <Icon
                icon="majesticons:creditcard"
                className="text-gray-500"
                height={46}
              />
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
                <TableColumn>AHORRO</TableColumn>
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
                        size="sm"
                        variant="bordered"
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
                        {formatCurrency(account.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={account.isSavingsAccount ? "success" : "default"}
                        size="sm"
                        variant="dot"
                      >
                        {account.isSavingsAccount ? "Sí" : "No"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={account.isActive ? "success" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {account.isActive ? "Activa" : "Inactiva"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          color={account.isActive ? "default" : "success"}
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            confirmToggleStatus(
                              account.id,
                              account.name,
                              account.isActive
                            )
                          }
                        >
                          {account.isActive ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          startContent={<Trash className="w-3 h-3" />}
                          variant="flat"
                          onPress={() =>
                            confirmDeleteAccount(account.id, account.name)
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
      <Modal
        isDismissable={false}
        isOpen={isNewAccountOpen}
        onOpenChange={onNewAccountOpenChange}
      >
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
                    label="Balance inicial"
                    placeholder="0.00"
                    startContent={
                      <span className="text-default-400 text-small">$</span>
                    }
                    type="number"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, balance: e.target.value })
                    }
                  />
                  <Checkbox
                    isSelected={newAccount.isSavingsAccount}
                    onValueChange={(value) =>
                      setNewAccount({ ...newAccount, isSavingsAccount: value })
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-small">Destinar para ahorros</span>
                      <span className="text-tiny text-default-400">
                        Los transfers a esta cuenta se categorizarán automáticamente como "Ahorro"
                      </span>
                    </div>
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newAccount.name.trim()}
                  isLoading={isCreating}
                  onPress={() => handleCreateAccount(onClose)}
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        size="sm"
        onOpenChange={onDeleteConfirmOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <span>Confirmar Eliminación</span>
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar la cuenta &quot;
              {accountToDelete?.name}&quot;? Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={cancelDeleteAccount}
            >
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDeleteAccount}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        isOpen={isToggleConfirmOpen}
        size="sm"
        onOpenChange={onToggleConfirmOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <span>Confirmar Cambio de Estado</span>
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas{" "}
              {accountToToggle?.isActive ? "desactivar" : "activar"} la cuenta
              &quot;
              {accountToToggle?.name}&quot;?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={cancelToggleStatus}
            >
              Cancelar
            </Button>
            <Button
              color={accountToToggle?.isActive ? "warning" : "success"}
              onPress={handleToggleStatus}
            >
              {accountToToggle?.isActive ? "Desactivar" : "Activar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
