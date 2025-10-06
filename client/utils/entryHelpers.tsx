import { formatCurrency } from "@/lib/formatters";

export type EntryType = "INCOME" | "EXPENSE" | "TRANSFER";

/**
 * Gets the icon for a specific entry type
 */
export function getTypeIcon(type: EntryType): string {
  switch (type) {
    case "INCOME":
      return "game-icons:receive-money";
    case "EXPENSE":
      return "game-icons:pay-money";
    case "TRANSFER":
      return "hugeicons:money-exchange-03";
    default:
      return "heroicons:circle";
  }
}

/**
 * Gets the color classes for entry type (for card backgrounds)
 */
export function getTypeColor(type: EntryType): string {
  switch (type) {
    case "INCOME":
      return "bg-success/10 text-success border-success/20";
    case "EXPENSE":
      return "bg-danger/10 text-danger border-danger/20";
    case "TRANSFER":
      return "bg-secondary/10 text-secondary border-secondary/20";
    default:
      return "bg-default/10 text-default border-default/20";
  }
}

/**
 * Gets the chip color for entry type (for Hero UI Chip component)
 */
export function getChipColor(
  type: EntryType,
): "success" | "danger" | "secondary" | "default" {
  switch (type) {
    case "INCOME":
      return "success";
    case "EXPENSE":
      return "danger";
    case "TRANSFER":
      return "secondary";
    default:
      return "default";
  }
}

/**
 * Gets the label for a specific entry type
 */
export function getTypeLabel(type: EntryType): string {
  switch (type) {
    case "INCOME":
      return "Ingreso";
    case "EXPENSE":
      return "Gasto";
    case "TRANSFER":
      return "Transferencia";
    default:
      return "";
  }
}

/**
 * Formats an amount with appropriate sign based on entry type
 */
export function formatAmount(amount: number, type: EntryType): string {
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
}

/**
 * Gets the text color class for amount display
 */
export function getAmountColor(type: EntryType): string {
  switch (type) {
    case "EXPENSE":
      return "text-red-600";
    case "INCOME":
      return "text-green-600";
    case "TRANSFER":
      return "text-secondary";
    default:
      return "text-default";
  }
}
