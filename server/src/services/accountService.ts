import { PrismaClient } from '@prisma/client';
import { AccountType } from '../types/enums';

const prisma = new PrismaClient();

interface CreateAccountData {
  name: string;
  type: AccountType;
  balance: number;
  userId: string;
  isSavingsAccount?: boolean;
}

interface UpdateAccountData {
  name?: string;
  type?: AccountType;
  balance?: number;
  isActive?: boolean;
  isSavingsAccount?: boolean;
}

export const accountService = {
  async getAllByUserId(userId: string, activeOnly: boolean = true) {
    return await prisma.account.findMany({
      where: {
        userId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { entryAccounts: true },
        },
      },
    });
  },

  async getByIdAndUserId(id: string, userId: string) {
    return await prisma.account.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { entryAccounts: true },
        },
      },
    });
  },

  async create(data: CreateAccountData) {
    return await prisma.account.create({
      data,
      include: {
        _count: {
          select: { entryAccounts: true },
        },
      },
    });
  },

  async updateByIdAndUserId(id: string, userId: string, data: UpdateAccountData) {
    try {
      return await prisma.account.update({
        where: { id, userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: { entryAccounts: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  async deleteByIdAndUserId(id: string, userId: string) {
    try {
      const account = await prisma.account.findFirst({
        where: { id, userId },
        include: {
          _count: {
            select: { entryAccounts: true },
          },
        },
      });

      if (!account) return false;

      if (account._count.entryAccounts > 0) {
        await prisma.account.update({
          where: { id, userId: userId },
          data: { isActive: false },
        });
      } else {
        await prisma.account.delete({
          where: { id },
        });
      }

      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  },

  async getNetWorthByUserId(userId: string) {
    const result = await prisma.account.aggregate({
      where: {
        userId,
        isActive: true,
      },
      _sum: {
        balance: true,
      },
    });

    return result._sum.balance || 0;
  },

  async getAccountsDistributionByUserId(userId: string) {
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        balance: true,
        type: true,
      },
      orderBy: { balance: 'desc' },
    });

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance.toNumber(), 0);

    return accounts.map((account) => {
      const balance = account.balance.toNumber();
      const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;

      return {
        id: account.id,
        name: account.name,
        balance,
        percentage: Math.round(percentage * 100) / 100,
        type: account.type,
      };
    });
  },

  async updateBalance(
    id: string,
    userId: string,
    amount: number,
    operation: 'add' | 'subtract' = 'add'
  ) {
    const account = await this.getByIdAndUserId(id, userId);
    if (!account) return null;

    const newBalance =
      operation === 'add'
        ? account.balance.toNumber() + amount
        : account.balance.toNumber() - amount;

    return await this.updateByIdAndUserId(id, userId, { balance: newBalance });
  },

  async getAccountsByType(userId: string, type: AccountType) {
    return await prisma.account.findMany({
      where: {
        userId,
        type,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  },
};
