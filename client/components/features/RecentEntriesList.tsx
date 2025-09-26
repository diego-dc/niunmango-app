"use client";

import { Icon } from "@iconify/react";
import { formatCurrency } from "@/lib/formatters";

type EntryType = "INCOME" | "EXPENSE" | "TRANSFER";

interface Entry {
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

interface RecentEntriesListProps {
  entries: Entry[];
}

export function RecentEntriesList({ entries }: RecentEntriesListProps) {
  const getTypeIcon = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "heroicons:arrow-down-left";
      case "EXPENSE":
        return "heroicons:arrow-up-right";
      case "TRANSFER":
        return "heroicons:arrow-right-left";
      default:
        return "heroicons:circle";
    }
  };

  const getTypeColor = (type: EntryType) => {
    switch (type) {
      case "INCOME":
        return "bg-success/10 text-success border-success/20";
      case "EXPENSE":
        return "bg-danger/10 text-danger border-danger/20";
      case "TRANSFER":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-default/10 text-default border-default/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatAmount = (amount: number, type: EntryType) => {
    const currency = formatCurrency(amount);
    switch (type) {
      case "INCOME":
        return `+${currency}`;
      case "EXPENSE":
        return `-${currency}`;
      case "TRANSFER":
        return currency;
      default:
        return currency;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon
          icon="heroicons:document-text"
          className="mx-auto text-default-300 mb-3"
          width={48}
        />
        <p className="text-default-500">No hay entradas recientes</p>
      </div>
    );
  }

  // Group entries by date
  const entriesByDate = entries.reduce((groups, entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, Entry[]>);

  return (
    <div className="space-y-6">
      {Object.entries(entriesByDate).map(([dateKey, dayEntries]) => (
        <div key={dateKey} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium text-default-600 capitalize">
              {formatDate(dayEntries[0].date)}
            </h4>
            <div className="flex-1 h-px bg-divider" />
          </div>

          {/* Entries for this date */}
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <div
                key={entry.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${getTypeColor(entry.type)}
                  hover:scale-[1.01] transition-transform cursor-pointer
                `}
              >
                {/* Type Icon */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center">
                    <Icon
                      icon={getTypeIcon(entry.type)}
                      width={16}
                      className="text-current"
                    />
                  </div>
                </div>

                {/* Entry Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {entry.category?.name || "Sin categoría"}
                    </p>
                    {entry.description && entry.description.trim() !== "" && (
                      <p className="text-xs text-current/70 truncate">
                        - {entry.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0">
                  <p className="text-sm font-semibold">
                    {formatAmount(entry.amount, entry.type)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}