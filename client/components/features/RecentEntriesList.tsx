"use client";

import { Icon } from "@iconify/react";
import {
  EntryType,
  getTypeIcon,
  getTypeColor,
  formatAmount
} from "@/utils/entryHelpers";
import {
  formatDateLong,
  groupByDate,
  sortGroupedDates
} from "@/utils/dateHelpers";

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

  return (
    <div className="space-y-6">
      {sortGroupedDates(groupByDate(entries, (entry) => entry.date)).map(([dateKey, dayEntries]) => (
        <div key={dateKey} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium text-default-600 capitalize">
              {formatDateLong(dayEntries[0].date)}
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
