// Financial entry types
export enum EntryType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
  TRANSFER = "TRANSFER",
}

// Account types for different financial accounts
export enum AccountType {
  SAVINGS = "SAVINGS",
  CHECKING = "CHECKING",
  CREDIT_CARD = "CREDIT_CARD",
  CASH = "CASH",
  INVESTMENT = "INVESTMENT",
  OTHER = "OTHER",
}

// Type guards for runtime validation
export const isValidEntryType = (value: string): value is EntryType => {
  return Object.values(EntryType).includes(value as EntryType);
};

export const isValidAccountType = (value: string): value is AccountType => {
  return Object.values(AccountType).includes(value as AccountType);
};

// Helper functions for display
export const getEntryTypeLabel = (type: EntryType): string => {
  switch (type) {
    case EntryType.EXPENSE:
      return "Gasto";
    case EntryType.INCOME:
      return "Ingreso";
    case EntryType.TRANSFER:
      return "Transferencia";
    default:
      return type;
  }
};

export const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case AccountType.SAVINGS:
      return "Ahorros";
    case AccountType.CHECKING:
      return "Cuenta Corriente";
    case AccountType.CREDIT_CARD:
      return "Tarjeta de Crédito";
    case AccountType.CASH:
      return "Efectivo";
    case AccountType.INVESTMENT:
      return "Inversión";
    case AccountType.OTHER:
      return "Otro";
    default:
      return type;
  }
};
