import { Request, Response } from "express";
import { accountService } from "../services/accountService";
import { isValidAccountType } from "../types/enums";

export const accountController = {
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const accounts = await accountService.getAllByUserId(userId, false); // Show all accounts (active and inactive)
      return res.json(accounts);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const account = await accountService.getByIdAndUserId(id || "", userId);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      return res.json(account);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch account" });
    }
  },

  async getNetWorth(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const netWorth = await accountService.getNetWorthByUserId(userId);
      return res.json({ netWorth });
    } catch (error) {
      return res.status(500).json({ error: "Failed to calculate net worth" });
    }
  },

  async getDistribution(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const distribution = await accountService.getAccountsDistributionByUserId(userId);
      return res.json(distribution);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get accounts distribution" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, type, balance = 0 } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }

      if (!isValidAccountType(type)) {
        return res.status(400).json({ error: "Invalid account type" });
      }

      const account = await accountService.create({
        name,
        type,
        balance: Number(balance),
        userId,
      });
      return res.status(201).json(account);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Account name already exists" });
      }
      return res
        .status(500)
        .json({ error: "Failed to create account", message: error });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, balance, isActive } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (type) {
        if (!isValidAccountType(type)) {
          return res.status(400).json({ error: "Invalid account type" });
        }
        updateData.type = type;
      }
      if (balance !== undefined) updateData.balance = Number(balance);
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const account = await accountService.updateByIdAndUserId(
        id || "",
        userId,
        updateData
      );
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      return res.json(account);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Account name already exists" });
      }
      return res.status(500).json({ error: "Failed to update account" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deleted = await accountService.deleteByIdAndUserId(
        id || "",
        userId
      );
      if (!deleted) {
        return res.status(404).json({ error: "Account not found" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete account" });
    }
  },
};
