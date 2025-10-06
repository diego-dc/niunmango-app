/**
 * Formats a date for display with full weekday, day and month
 * Example: "lunes, 15 enero"
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Formats a date for display in short format
 * Example: "15/01/2024"
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Formats a date for display with medium format
 * Example: "15 enero 2024"
 */
export function formatDateMedium(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Gets the current date in YYYY-MM-DD format for input fields
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Checks if two dates are on the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return d1.toDateString() === d2.toDateString();
}

/**
 * Groups items by date using a date key extractor function
 */
export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => string,
): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const dateKey = new Date(getDate(item)).toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);

      return groups;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Sorts grouped date entries by date (most recent first)
 * Also sorts entries within each group if they have a createdAt field
 */
export function sortGroupedDates<T>(
  groupedItems: Record<string, T[]>,
): [string, T[]][] {
  return Object.entries(groupedItems)
    .sort(([dateKeyA], [dateKeyB]) => {
      return new Date(dateKeyB).getTime() - new Date(dateKeyA).getTime();
    })
    .map(([dateKey, items]) => {
      // Sort items within each group by createdAt if available
      const sortedItems = [...items].sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        return 0;
      });

      return [dateKey, sortedItems] as [string, T[]];
    });
}
