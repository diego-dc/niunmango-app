import { PrismaClient } from "@prisma/client";
import { EntryType } from "../types/enums";

const prisma = new PrismaClient();

interface CreateEntryData {
  type: EntryType;
  amount: number;
  description: string;
  categoryId: string | null;
  userId: string;
  date?: Date;
  accountEntries: {
    accountId: string;
    amount: number;
  }[];
}

interface UpdateEntryData {
  type?: EntryType;
  amount?: number;
  description?: string;
  categoryId?: string | null;
  date?: Date;
  accountEntries?: {
    accountId: string;
    amount: number;
  }[];
}

interface EntryFilters {
  type?: EntryType;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const entryService = {
  async getAllByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: EntryFilters = {}
  ) {
    const offset = (page - 1) * limit;

    const where: any = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          category: true,
          entryAccounts: {
            include: {
              account: true,
            },
          },
        },
      }),
      prisma.entry.count({ where }),
    ]);

    return {
      entries,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  },

  async getByIdAndUserId(id: string, userId: string) {
    return await prisma.entry.findFirst({
      where: { id, userId },
      include: {
        category: true,
        entryAccounts: {
          include: {
            account: true,
          },
        },
      },
    });
  },

  async create(data: CreateEntryData) {
    return await prisma.$transaction(async (tx: any) => {
      let finalCategoryId = data.categoryId;

      // Auto-assign "Ahorro" category if it's a transfer to a savings account
      if (data.type === EntryType.TRANSFER && data.accountEntries.length > 0) {
        // Find the destination account (the one with positive amount)
        const destinationAccountEntry = data.accountEntries.find(
          (ae) => ae.amount > 0
        );

        if (destinationAccountEntry) {
          const destinationAccount = await tx.account.findUnique({
            where: { id: destinationAccountEntry.accountId },
          });

          if (destinationAccount && destinationAccount.isSavingsAccount) {
            // Find the "Ahorro" category for this user
            const savingsCategory = await tx.category.findFirst({
              where: {
                userId: data.userId,
                name: "Ahorro",
              },
            });

            if (savingsCategory) {
              finalCategoryId = savingsCategory.id;
            }
          }
        }
      }

      const entry = await tx.entry.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          categoryId: finalCategoryId,
          userId: data.userId,
          date: data.date || new Date(),
        },
        include: {
          category: true,
        },
      });

      for (const accountEntry of data.accountEntries) {
        await tx.entryAccount.create({
          data: {
            entryId: entry.id,
            accountId: accountEntry.accountId,
            amount: accountEntry.amount,
          },
        });

        // Handle different entry types
        if (data.type === EntryType.TRANSFER) {
          // For transfers, use the amount directly (can be positive or negative)
          await tx.account.update({
            where: { id: accountEntry.accountId },
            data: {
              balance: {
                increment: accountEntry.amount,
              },
            },
          });
        } else {
          // For INCOME/EXPENSE, use the traditional logic
          const multiplier = data.type === EntryType.EXPENSE ? -1 : 1;
          await tx.account.update({
            where: { id: accountEntry.accountId },
            data: {
              balance: {
                increment: accountEntry.amount * multiplier,
              },
            },
          });
        }
      }

      return await tx.entry.findUnique({
        where: { id: entry.id },
        include: {
          category: true,
          entryAccounts: {
            include: {
              account: true,
            },
          },
        },
      });
    });
  },

  async updateByIdAndUserId(id: string, userId: string, data: UpdateEntryData) {
    return await prisma.$transaction(async (tx: any) => {
      const existingEntry = await tx.entry.findFirst({
        where: { id, userId },
        include: {
          entryAccounts: true,
        },
      });

      if (!existingEntry) return null;

      if (data.accountEntries) {
        // Revert the previous account changes
        for (const existingAccountEntry of existingEntry.entryAccounts) {
          if (existingEntry.type === EntryType.TRANSFER) {
            // For transfers, revert the exact amount
            await tx.account.update({
              where: { id: existingAccountEntry.accountId },
              data: {
                balance: {
                  increment: -existingAccountEntry.amount.toNumber(),
                },
              },
            });
          } else {
            // For INCOME/EXPENSE, use the traditional logic
            const multiplier =
              existingEntry.type === EntryType.EXPENSE ? 1 : -1;
            await tx.account.update({
              where: { id: existingAccountEntry.accountId },
              data: {
                balance: {
                  increment:
                    existingAccountEntry.amount.toNumber() * multiplier,
                },
              },
            });
          }
        }

        await tx.entryAccount.deleteMany({
          where: { entryId: id },
        });
      }

      let finalCategoryId = data.categoryId;
      const entryType = data.type || existingEntry.type;

      // Auto-assign "Ahorro" category if it's a transfer to a savings account
      if (
        entryType === EntryType.TRANSFER &&
        data.accountEntries &&
        data.accountEntries.length > 0
      ) {
        // Find the destination account (the one with positive amount)
        const destinationAccountEntry = data.accountEntries.find(
          (ae) => ae.amount > 0
        );

        if (destinationAccountEntry) {
          const destinationAccount = await tx.account.findUnique({
            where: { id: destinationAccountEntry.accountId },
          });

          if (destinationAccount && destinationAccount.isSavingsAccount) {
            // Find the "Ahorro" category for this user
            const savingsCategory = await tx.category.findFirst({
              where: {
                userId: userId,
                name: "Ahorro",
              },
            });

            if (savingsCategory) {
              finalCategoryId = savingsCategory.id;
            }
          }
        }
      }

      await tx.entry.update({
        where: { id },
        data: {
          ...(data.type && { type: data.type }),
          ...(data.amount && { amount: data.amount }),
          ...(data.description && { description: data.description }),
          ...(finalCategoryId !== undefined && { categoryId: finalCategoryId }),
          ...(data.date && { date: data.date }),
        },
      });

      if (data.accountEntries) {
        for (const accountEntry of data.accountEntries) {
          await tx.entryAccount.create({
            data: {
              entryId: id,
              accountId: accountEntry.accountId,
              amount: accountEntry.amount,
            },
          });

          // Handle different entry types
          if (entryType === EntryType.TRANSFER) {
            // For transfers, use the amount directly (can be positive or negative)
            await tx.account.update({
              where: { id: accountEntry.accountId },
              data: {
                balance: {
                  increment: accountEntry.amount,
                },
              },
            });
          } else {
            // For INCOME/EXPENSE, use the traditional logic
            const multiplier = entryType === EntryType.EXPENSE ? -1 : 1;
            await tx.account.update({
              where: { id: accountEntry.accountId },
              data: {
                balance: {
                  increment: accountEntry.amount * multiplier,
                },
              },
            });
          }
        }
      }

      return await tx.entry.findUnique({
        where: { id },
        include: {
          category: true,
          entryAccounts: {
            include: {
              account: true,
            },
          },
        },
      });
    });
  },

  async deleteByIdAndUserId(id: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const entry = await tx.entry.findFirst({
        where: { id, userId },
        include: {
          entryAccounts: true,
        },
      });

      if (!entry) return false;

      for (const accountEntry of entry.entryAccounts) {
        const multiplier = entry.type === EntryType.EXPENSE ? 1 : -1;
        await tx.account.update({
          where: { id: accountEntry.accountId },
          data: {
            balance: {
              increment: accountEntry.amount.toNumber() * multiplier,
            },
          },
        });
      }

      await tx.entryAccount.deleteMany({
        where: { entryId: id },
      });

      await tx.entry.delete({
        where: { id },
      });

      return true;
    });
  },

  async getStatsByUserId(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [income, expenses] = await Promise.all([
      prisma.entry.aggregate({
        where: { ...where, type: EntryType.INCOME },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.entry.aggregate({
        where: { ...where, type: EntryType.EXPENSE },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    return {
      income: {
        total: totalIncome,
        count: income._count,
      },
      expenses: {
        total: totalExpenses,
        count: expenses._count,
      },
      netIncome: Number(totalIncome) - Number(totalExpenses),
      totalTransactions: income._count + expenses._count,
    };
  },

  async getByCategory(
    userId: string,
    categoryId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = { userId, categoryId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return await prisma.entry.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        category: true,
        entryAccounts: {
          include: {
            account: true,
          },
        },
      },
    });
  },

  async getRecentByUserId(userId: string, limit: number = 5) {
    return await prisma.entry.findMany({
      where: { userId },
      take: limit,
      orderBy: { date: "desc" },
      include: {
        category: true,
        entryAccounts: {
          include: {
            account: true,
          },
        },
      },
    });
  },
};
