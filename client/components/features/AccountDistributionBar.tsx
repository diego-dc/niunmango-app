"use client";

import { formatCurrency } from "@/lib/formatters";

interface AccountDistribution {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  type: string;
}

interface AccountDistributionBarProps {
  accounts: AccountDistribution[];
}

export function AccountDistributionBar({
  accounts,
}: AccountDistributionBarProps) {
  // Colors for different account types, inspired by iOS storage colors
  const getColorForAccount = (index: number, type: string) => {
    const colors = [
      { bg: "bg-primary", text: "text-white" }, // Primary
      { bg: "bg-secondary", text: "text-white" }, // Success green
      { bg: "bg-indigo-500", text: "text-indigo-50" }, // Indigo
      { bg: "bg-purple-500", text: "text-purple-50" }, // Purple
      { bg: "bg-orange-500", text: "text-orange-50" }, // Warning orange
      { bg: "bg-pink-500", text: "text-pink-50" }, // Pink
      { bg: "bg-teal-500", text: "text-teal-50" }, // Teal
    ];

    return colors[index % colors.length];
  };

  // Filter out accounts with 0 balance
  const visibleAccounts = accounts.filter((account) => account.balance > 0);

  if (visibleAccounts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-default-500">No hay cuentas con balance</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Distribution Bar */}
      <div className="relative w-full h-8 bg-default-100 rounded-full overflow-hidden flex">
        {visibleAccounts.map((account, index) => {
          const color = getColorForAccount(index, account.type);

          return (
            <div
              key={account.id}
              className={`${color.bg} ${color.text} flex items-center justify-center relative group`}
              style={{ width: `${account.percentage}%` }}
            >
              {/* Account name - only show if segment is wide enough */}
              {account.percentage > 15 && (
                <span className="text-xs font-medium px-1 truncate">
                  {account.name}
                </span>
              )}

              {/* Tooltip on hover */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {account.name}: {formatCurrency(account.balance)} (
                {account.percentage.toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {visibleAccounts.map((account, index) => {
          const color = getColorForAccount(index, account.type);

          return (
            <div key={account.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${color.bg} rounded-sm flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{account.name}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-default-500">
                    {account.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs font-medium">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
