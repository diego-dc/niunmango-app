import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateBudgetItemData {
  budgetId: string;
  categoryId: string;
  budgetedAmount: number;
  userId: string;
}

interface UpdateBudgetItemData {
  budgetedAmount: number;
}

export const budgetItemService = {
  async getByBudgetIdAndUserId(budgetId: string, userId: string) {
    return await prisma.budgetItem.findMany({
      where: {
        budgetId,
        budget: {
          userId
        }
      },
      include: {
        category: true,
        budget: true
      },
      orderBy: {
        category: {
          name: "asc"
        }
      }
    });
  },

  async getByIdAndUserId(id: string, userId: string) {
    return await prisma.budgetItem.findFirst({
      where: {
        id,
        budget: {
          userId
        }
      },
      include: {
        category: true,
        budget: true
      }
    });
  },

  async create(data: CreateBudgetItemData) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: data.budgetId,
        userId: data.userId
      }
    });

    if (!budget) {
      throw new Error("Budget not found or access denied");
    }

    return await prisma.budgetItem.create({
      data: {
        budgetId: data.budgetId,
        categoryId: data.categoryId,
        budgetedAmount: data.budgetedAmount
      },
      include: {
        category: true,
        budget: true
      }
    });
  },

  async updateByIdAndUserId(id: string, userId: string, data: UpdateBudgetItemData) {
    try {
      const existingItem = await this.getByIdAndUserId(id, userId);
      if (!existingItem) return null;

      return await prisma.budgetItem.update({
        where: { id },
        data,
        include: {
          category: true,
          budget: true
        }
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },

  async deleteByIdAndUserId(id: string, userId: string) {
    try {
      const existingItem = await this.getByIdAndUserId(id, userId);
      if (!existingItem) return false;

      await prisma.budgetItem.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === "P2025") {
        return false;
      }
      throw error;
    }
  },

  async getBudgetItemProgress(id: string, userId: string) {
    const budgetItem = await this.getByIdAndUserId(id, userId);
    if (!budgetItem) return null;

    const spentResult = await prisma.entry.aggregate({
      where: {
        userId,
        categoryId: budgetItem.categoryId,
        type: 'EXPENSE',
        date: {
          gte: budgetItem.budget.startDate,
          lte: budgetItem.budget.endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    const spent = spentResult._sum.amount || 0;
    const remaining = Number(budgetItem.budgetedAmount) - Number(spent);
    const percentage = Number(budgetItem.budgetedAmount) > 0 
      ? (Number(spent) / Number(budgetItem.budgetedAmount)) * 100 
      : 0;

    return {
      ...budgetItem,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      transactionCount: spentResult._count
    };
  }
};