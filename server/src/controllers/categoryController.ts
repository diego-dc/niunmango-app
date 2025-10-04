import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";

export const categoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const categories = await categoryService.getAllByUserId(userId);
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const category = await categoryService.getByIdAndUserId(id || "", userId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.json(category);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch category" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const category = await categoryService.create({ name, userId });
      return res.status(201).json(category);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Category name already exists" });
      }
      return res.status(500).json({ error: "Failed to create category" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const category = await categoryService.updateByIdAndUserId(
        id || "",
        userId,
        {
          name,
        }
      );
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.json(category);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Category name already exists" });
      }
      return res.status(500).json({ error: "Failed to update category" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deleted = await categoryService.deleteByIdAndUserId(
        id || "",
        userId
      );
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete category" });
    }
  },
};
