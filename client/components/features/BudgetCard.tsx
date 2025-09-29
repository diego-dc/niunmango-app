"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { formatCurrency } from "@/lib/formatters";
import { Budget } from "@/hooks/useBudgets";
import { truncateText } from "@/utils/text";

interface BudgetCardProps {
  budget: Budget;
  onClick?: () => void;
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    return "success";
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString("es-ES", { month: "numeric" });
    const endMonth = end.toLocaleDateString("es-ES", { month: "numeric" });

    return `${startMonth} / ${start.getDate()} - ${endMonth} / ${end.getDate()}`;
  };

  return (
    <Card
      className="w-80 min-w-80 cursor-pointer hover:scale-[1.02] transition-transform"
      isPressable
      onPress={onClick}
    >
      <CardHeader className="flex flex-col items-start gap-2 p-4">
        <div className="flex flex-col items-start w-full gap-3">
          <Chip
            size="sm"
            variant="bordered"
            color="primary"
            startContent={<Icon icon="majesticons:calendar" className="mr-1" />}
          >
            {formatDateRange(budget.startDate, budget.endDate)}
          </Chip>
          <h3 className="text-lg font-semibold text-start">
            {truncateText(budget.name, 25)}
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-default-500">Progreso Total</span>
            <span className="text-sm font-medium">
              {budget.overallPercentage.toFixed(1)}%
            </span>
          </div>

          <Progress
            value={budget.overallPercentage}
            color={getProgressColor(budget.overallPercentage)}
            size="sm"
          />

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-xs text-default-500">Presupuestado</p>
              <p className="text-sm font-medium text-success">
                {formatCurrency(budget.totalBudgeted)}
              </p>
            </div>
            <div>
              <p className="text-xs text-default-500">Gastado</p>
              <p className="text-sm font-medium text-danger">
                {formatCurrency(budget.totalSpent)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-divider">
            <span className="text-xs text-default-500">Restante</span>
            <span
              className={`text-sm font-medium ${
                budget.totalBudgeted - budget.totalSpent >= 0
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {formatCurrency(budget.totalBudgeted - budget.totalSpent)}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between items-center w-full">
          <Chip
            size="sm"
            variant="flat"
            startContent={<Icon icon="heroicons:folder" className="mr-1" />}
          >
            {budget.budgetItems.length} categorías
          </Chip>
          <Icon
            icon="heroicons:chevron-right"
            className="text-default-400"
            width={16}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
