import { Request, Response } from "express";
import { entryService } from "../services/entryService";
import { EntryType, isValidEntryType } from "../types/enums";

export const entryController = {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const {
        page = 1,
        limit = 20,
        type,
        categoryId,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (type && isValidEntryType(type as string))
        filters.type = type as EntryType;
      if (categoryId) filters.categoryId = categoryId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const entries = await entryService.getAllByUserId(
        userId,
        Number(page),
        Number(limit),
        filters
      );
      return res.json(entries);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch entries" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const entry = await entryService.getByIdAndUserId(id!, userId);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      return res.json(entry);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch entry" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { type, amount, description, categoryId, date, accountEntries } =
        req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (
        !type ||
        !amount ||
        !categoryId ||
        !accountEntries ||
        accountEntries.length === 0
      ) {
        return res.status(400).json({
          error:
            "Type, amount, categoryId, and at least one account entry are required",
        });
      }

      if (!isValidEntryType(type)) {
        return res.status(400).json({ error: "Invalid entry type" });
      }

      const totalAccountAmount = accountEntries.reduce(
        (sum: number, ae: any) => sum + Number(ae.amount),
        0
      );
      if (Math.abs(totalAccountAmount - Number(amount)) > 0.01) {
        return res.status(400).json({
          error: "Sum of account amounts must equal entry amount",
        });
      }

      const entry = await entryService.create({
        type,
        amount: Number(amount),
        description,
        categoryId,
        userId,
        date: date ? new Date(date) : new Date(),
        accountEntries: accountEntries.map((ae: any) => ({
          accountId: ae.accountId,
          amount: Number(ae.amount),
        })),
      });

      return res.status(201).json(entry);
    } catch (error) {
      console.error("Failed to create entry:", error);
      return res.status(500).json({ error: "Failed to create entry" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, amount, description, categoryId, date, accountEntries } =
        req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updateData: any = {};
      if (type) {
        if (!isValidEntryType(type)) {
          return res.status(400).json({ error: "Invalid entry type" });
        }
        updateData.type = type;
      }
      if (amount !== undefined) updateData.amount = Number(amount);
      if (description) updateData.description = description;
      if (categoryId) updateData.categoryId = categoryId;
      if (date) updateData.date = new Date(date);

      if (accountEntries) {
        const totalAccountAmount = accountEntries.reduce(
          (sum: number, ae: any) => sum + Number(ae.amount),
          0
        );
        const entryAmount = amount !== undefined ? Number(amount) : undefined;

        if (entryAmount && Math.abs(totalAccountAmount - entryAmount) > 0.01) {
          return res.status(400).json({
            error: "Sum of account amounts must equal entry amount",
          });
        }

        updateData.accountEntries = accountEntries.map((ae: any) => ({
          accountId: ae.accountId,
          amount: Number(ae.amount),
        }));
      }

      const entry = await entryService.updateByIdAndUserId(
        id!,
        userId,
        updateData
      );
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      return res.json(entry);
    } catch (error) {
      console.error("Failed to update entry:", error);
      return res.status(500).json({ error: "Failed to update entry" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deleted = await entryService.deleteByIdAndUserId(id!, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Entry not found" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete entry" });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { startDate, endDate } = req.query;

      const stats = await entryService.getStatsByUserId(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }
  },
};
