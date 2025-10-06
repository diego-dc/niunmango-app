"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";

import { formatCurrency } from "@/lib/formatters";
import { Budget } from "@/hooks/useBudgets";

interface BudgetDetailsModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetDetailsModal({
  budget,
  isOpen,
  onClose,
}: BudgetDetailsModalProps) {
  if (!budget) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";

    return "success";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(budget.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const sortedBudgetItems = [...budget.budgetItems].sort(
    (a, b) => b.percentage - a.percentage,
  );

  const daysRemaining = getDaysRemaining();

  return (
    <Modal
      classNames={{
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-2">
            <Chip
              className="px-2"
              color={daysRemaining > 0 ? "success" : "danger"}
              size="md"
              startContent={<Icon className="mx-1" icon="heroicons:calendar" />}
              variant="flat"
            >
              {daysRemaining > 0
                ? `${daysRemaining} días restantes`
                : "Vencido"}
            </Chip>
            <h2 className="text-xl font-bold">{budget.name}</h2>
          </div>
          <div className="flex gap-2 text-sm text-default-500">
            <span>{formatDate(budget.startDate)}</span>
            <span>-</span>
            <span>{formatDate(budget.endDate)}</span>
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          {/* Overall Progress */}
          <div>
            <div>
              <h3 className="text-lg font-semibold">Estado Actual</h3>
            </div>
            <div className="gap-4">
              <div className="flex justify-between items-center">
                <span className="text-default-600">Estado General</span>
                <span className="text-lg font-semibold">
                  {budget.overallPercentage.toFixed(1)}%
                </span>
              </div>

              <Progress
                showValueLabel
                color={getProgressColor(budget.overallPercentage)}
                size="lg"
                value={budget.overallPercentage}
              />

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-default-500">Presupuesto</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(budget.totalBudgeted)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Gastado</p>
                  <p className="text-lg font-semibold text-danger">
                    {formatCurrency(budget.totalSpent)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Restante</p>
                  <p
                    className={`text-lg font-semibold ${
                      budget.totalBudgeted - budget.totalSpent >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {formatCurrency(budget.totalBudgeted - budget.totalSpent)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Items by Category */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Desglose por Categoría
            </h3>
            <div className="space-y-4">
              {sortedBudgetItems.map((item, _index) => (
                <Card key={item.id} className="border border-divider">
                  <CardBody className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          className="text-primary"
                          icon="heroicons:folder"
                          width={20}
                        />
                        <span className="font-medium">
                          {item.category.name}
                        </span>
                      </div>
                      <Chip
                        color={getProgressColor(item.percentage)}
                        size="sm"
                        variant="flat"
                      >
                        {item.percentage.toFixed(1)}%
                      </Chip>
                    </div>

                    <Progress
                      className="mb-3"
                      color={getProgressColor(item.percentage)}
                      size="sm"
                      value={item.percentage}
                    />

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-default-500">Presupuesto</p>
                        <p className="font-medium">
                          {formatCurrency(Number(item.budgetedAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-default-500">Gastado</p>
                        <p className="font-medium text-danger">
                          {formatCurrency(Number(item.spent))}
                        </p>
                      </div>
                      <div>
                        <p className="text-default-500">Restante</p>
                        <p
                          className={`font-medium ${
                            Number(item.budgetedAmount) - Number(item.spent) >=
                            0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {formatCurrency(
                            Number(item.budgetedAmount) - Number(item.spent),
                          )}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {budget.budgetItems.length === 0 && (
            <div className="text-center py-8">
              <Icon
                className="mx-auto text-default-300 mb-3"
                icon="heroicons:folder-open"
                width={48}
              />
              <p className="text-default-500">
                Este presupuesto no tiene categorías asignadas
              </p>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
