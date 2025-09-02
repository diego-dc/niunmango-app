import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateCategoryData {
  name: string;
  userId: string;
}

interface UpdateCategoryData {
  name?: string;
}

export const categoryService = {
  async getAllByUserId(userId: string) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  },

  async getByIdAndUserId(id: string, userId: string) {
    return await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  },

  async create(data: CreateCategoryData) {
    return await prisma.category.create({
      data,
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  },

  async updateByIdAndUserId(
    id: string,
    _userId: string,
    data: UpdateCategoryData
  ) {
    try {
      return await prisma.category.update({
        where: { id },
        data,
        include: {
          _count: {
            select: { entries: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },

  async deleteByIdAndUserId(id: string, _userId: string) {
    try {
      await prisma.category.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === "P2025") {
        return false;
      }
      throw error;
    }
  },

  async getWithEntriesCount(userId: string) {
    return await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },
};
