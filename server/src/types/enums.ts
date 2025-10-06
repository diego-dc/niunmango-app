// Financial entry types
export enum EntryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

// Account types for different financial accounts
export enum AccountType {
  CHECKING = 'CHECKING',
  CUENTA_RUT = 'CUENTA_RUT',
  CUENTA_VISTA = 'CUENTA_VISTA',
  BILLETERA_DIGITAL = 'BILLETERA_DIGITAL',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
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
      return 'Gasto';
    case EntryType.INCOME:
      return 'Ingreso';
    case EntryType.TRANSFER:
      return 'Transferencia';
    default:
      return type;
  }
};

export const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case AccountType.CHECKING:
      return 'Cuenta Corriente';
    case AccountType.CUENTA_RUT:
      return 'Cuenta Rut';
    case AccountType.CUENTA_VISTA:
      return 'Cuenta Vista';
    case AccountType.BILLETERA_DIGITAL:
      return 'Billetera Digital';
    case AccountType.SAVINGS:
      return 'Cuenta de Ahorro';
    case AccountType.INVESTMENT:
      return 'Cuenta de Inversión';
    case AccountType.CASH:
      return 'Efectivo';
    default:
      return type;
  }
};
