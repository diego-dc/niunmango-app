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
  async ensureSavingsCategory(userId: string) {
    try {
      // Check if savings category already exists by name first
      const existingByName = await prisma.category.findFirst({
        where: {
          userId,
          name: "Ahorro"
        }
      });

      if (existingByName) {
        return existingByName;
      }

      // Try to create savings category
      return await prisma.category.create({
        data: {
          name: "Ahorro",
          userId
        },
        include: {
          _count: {
            select: { entries: true },
          },
        },
      });
    } catch (error: any) {
      // If creation fails (e.g., unique constraint), just return null
      if (error.code === "P2002") {
        // Duplicate entry, try to find existing
        return await prisma.category.findFirst({
          where: { userId, name: "Ahorro" }
        });
      }
      throw error;
    }
  },

  async getAllByUserId(userId: string) {
    try {
      // Try to ensure savings category exists, but don't fail if it errors
      await this.ensureSavingsCategory(userId).catch(() => {
        // Silently ignore savings category creation errors
      });

      // Get all categories with fallback ordering
      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" }, // Simple ordering for now
        include: {
          _count: {
            select: { entries: true },
          },
        },
      });

      return categories;
    } catch (error) {
      // If this fails, return empty array instead of crashing
      console.error("Error fetching categories:", error);
      return [];
    }
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

  async deleteByIdAndUserId(id: string, userId: string) {
    try {
      // Check if this is the savings category by name
      const category = await prisma.category.findFirst({
        where: { id, userId }
      });

      if (category?.name === "Ahorro") {
        throw new Error("Cannot delete special categories");
      }

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
