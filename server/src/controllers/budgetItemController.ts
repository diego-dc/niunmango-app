import { Request, Response } from 'express';
import { budgetItemService } from '../services/budgetItemService';

export const budgetItemController = {
  async getByBudgetId(req: Request, res: Response) {
    try {
      const { budgetId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const budgetItems = await budgetItemService.getByBudgetIdAndUserId(budgetId || '', userId);
      return res.json(budgetItems);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch budget items' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const budgetItem = await budgetItemService.getByIdAndUserId(id || '', userId);
      if (!budgetItem) {
        return res.status(404).json({ error: 'Budget item not found' });
      }

      return res.json(budgetItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch budget item' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { budgetId, categoryId, budgetedAmount } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!budgetId || !categoryId || budgetedAmount === undefined) {
        return res.status(400).json({
          error: 'Budget ID, category ID, and budgeted amount are required',
        });
      }

      if (Number(budgetedAmount) < 0) {
        return res.status(400).json({
          error: 'Budgeted amount cannot be negative',
        });
      }

      const budgetItem = await budgetItemService.create({
        budgetId,
        categoryId,
        budgetedAmount: Number(budgetedAmount),
        userId,
      });

      return res.status(201).json(budgetItem);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Budget item for this category already exists in this budget',
        });
      }
      return res.status(500).json({ error: 'Failed to create budget item' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { budgetedAmount } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (budgetedAmount === undefined) {
        return res.status(400).json({ error: 'Budgeted amount is required' });
      }

      if (Number(budgetedAmount) < 0) {
        return res.status(400).json({
          error: 'Budgeted amount cannot be negative',
        });
      }

      const budgetItem = await budgetItemService.updateByIdAndUserId(id || '', userId, {
        budgetedAmount: Number(budgetedAmount),
      });

      if (!budgetItem) {
        return res.status(404).json({ error: 'Budget item not found' });
      }

      return res.json(budgetItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update budget item' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const deleted = await budgetItemService.deleteByIdAndUserId(id || '', userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Budget item not found' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete budget item' });
    }
  },
};
