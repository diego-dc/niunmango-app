import { Request, Response } from "express";
import { budgetService } from "../services/budgetService";

export const budgetController = {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const budgets = await budgetService.getAllByUserId(userId);

      // Add progress information to each budget
      const budgetsWithProgress = await Promise.all(
        budgets.map(async (budget) => {
          const progress = await budgetService.getBudgetProgressByIdAndUserId(budget.id, userId);
          return progress || budget;
        })
      );

      return res.json(budgetsWithProgress);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch budgets" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const budget = await budgetService.getByIdAndUserId(id || "", userId);
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      return res.json(budget);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch budget" });
    }
  },

  async getCurrent(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const currentBudget = await budgetService.getCurrentByUserId(userId);

      // Return null if no current budget exists - this is not an error
      return res.json(currentBudget);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch current budget" });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const activeBudgets = await budgetService.getActiveByUserId(userId);

      // Add progress information to each budget
      const budgetsWithProgress = await Promise.all(
        activeBudgets.map(async (budget) => {
          const progress = await budgetService.getBudgetProgressByIdAndUserId(budget.id, userId);
          return progress || budget;
        })
      );

      return res.json(budgetsWithProgress);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch active budgets" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, startDate, endDate, budgetItems } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          error: "Name, start date, and end date are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({
          error: "End date must be after start date",
        });
      }

      const budget = await budgetService.create({
        name,
        startDate: start,
        endDate: end,
        userId,
        budgetItems: budgetItems || [],
      });

      return res.status(201).json(budget);
    } catch (error) {
      console.error("Failed to create budget:", error);
      return res.status(500).json({ error: "Failed to create budget" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, startDate, endDate, budgetItems } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);

      if (
        updateData.startDate &&
        updateData.endDate &&
        updateData.startDate >= updateData.endDate
      ) {
        return res.status(400).json({
          error: "End date must be after start date",
        });
      }

      if (budgetItems) {
        updateData.budgetItems = budgetItems;
      }

      const budget = await budgetService.updateByIdAndUserId(
        id || "",
        userId,
        updateData
      );
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      return res.json(budget);
    } catch (error) {
      console.error("Failed to update budget:", error);
      return res.status(500).json({ error: "Failed to update budget" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deleted = await budgetService.deleteByIdAndUserId(id || "", userId);
      if (!deleted) {
        return res.status(404).json({ error: "Budget not found" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete budget" });
    }
  },

  async getProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const progress = await budgetService.getBudgetProgressByIdAndUserId(
        id || "",
        userId
      );
      if (!progress) {
        return res.status(404).json({ error: "Budget not found" });
      }

      return res.json(progress);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch budget progress" });
    }
  },
};
