import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateBudgetData {
  name: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  budgetItems?: {
    categoryId: string;
    budgetedAmount: number;
  }[];
}

interface UpdateBudgetData {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  budgetItems?: {
    categoryId: string;
    budgetedAmount: number;
  }[];
}

export const budgetService = {
  async getAllByUserId(userId: string) {
    return await prisma.budget.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      include: {
        budgetItems: {
          include: {
            category: true,
          },
        },
        _count: {
          select: { budgetItems: true },
        },
      },
    });
  },

  async getByIdAndUserId(id: string, userId: string) {
    return await prisma.budget.findFirst({
      where: { id, userId },
      include: {
        budgetItems: {
          include: {
            category: true,
          },
        },
      },
    });
  },

  async getCurrentByUserId(userId: string) {
    const now = new Date();
    return await prisma.budget.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        budgetItems: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });
  },

  async getActiveByUserId(userId: string) {
    const now = new Date();
    return await prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        budgetItems: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });
  },

  async create(data: CreateBudgetData) {
    return await prisma.$transaction(async (tx: any) => {
      const budget = await tx.budget.create({
        data: {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          userId: data.userId,
        },
      });

      if (data.budgetItems && data.budgetItems.length > 0) {
        await tx.budgetItem.createMany({
          data: data.budgetItems.map((item) => ({
            budgetId: budget.id,
            categoryId: item.categoryId,
            budgetedAmount: item.budgetedAmount,
          })),
        });
      }

      return await tx.budget.findUnique({
        where: { id: budget.id },
        include: {
          budgetItems: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  },

  async updateByIdAndUserId(
    id: string,
    userId: string,
    data: UpdateBudgetData
  ) {
    return await prisma.$transaction(async (tx: any) => {
      const existingBudget = await tx.budget.findFirst({
        where: { id, userId },
      });

      if (!existingBudget) return null;

      if (data.budgetItems) {
        await tx.budgetItem.deleteMany({
          where: { budgetId: id },
        });

        if (data.budgetItems.length > 0) {
          await tx.budgetItem.createMany({
            data: data.budgetItems.map((item) => ({
              budgetId: id,
              categoryId: item.categoryId,
              budgetedAmount: item.budgetedAmount,
            })),
          });
        }
      }

      await tx.budget.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
        },
      });

      return await tx.budget.findUnique({
        where: { id },
        include: {
          budgetItems: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  },

  async deleteByIdAndUserId(id: string, userId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: { id, userId },
      });

      if (!budget) return false;

      await prisma.$transaction([
        prisma.budgetItem.deleteMany({ where: { budgetId: id } }),
        prisma.budget.delete({ where: { id } }),
      ]);

      return true;
    } catch (error: any) {
      if (error.code === "P2025") {
        return false;
      }
      throw error;
    }
  },

  async getBudgetProgressByIdAndUserId(id: string, userId: string) {
    const budget = await this.getByIdAndUserId(id, userId);
    if (!budget) return null;

    const budgetItemsWithProgress = await Promise.all(
      budget.budgetItems.map(async (item: any) => {
        const spentResult = await prisma.entry.aggregate({
          where: {
            userId,
            categoryId: item.categoryId,
            type: "EXPENSE",
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = spentResult._sum.amount || 0;
        const remaining = Number(item.budgetedAmount) - Number(spent);
        const percentage =
          Number(item.budgetedAmount) > 0
            ? (Number(spent) / Number(item.budgetedAmount)) * 100
            : 0;

        return {
          ...item,
          spent,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
        };
      })
    );

    const totalBudgeted = budgetItemsWithProgress.reduce(
      (sum, item) => sum + Number(item.budgetedAmount),
      0
    );
    const totalSpent = budgetItemsWithProgress.reduce(
      (sum, item) => sum + Number(item.spent),
      0
    );

    return {
      ...budget,
      budgetItems: budgetItemsWithProgress,
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      overallPercentage:
        totalBudgeted > 0
          ? Math.round((totalSpent / totalBudgeted) * 10000) / 100
          : 0,
    };
  },

  async getBudgetsInDateRange(userId: string, startDate: Date, endDate: Date) {
    return await prisma.budget.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      include: {
        budgetItems: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });
  },
};
