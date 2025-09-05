import { Router } from "express";
import categoriesRouter from "./categories";
import accountsRouter from "./accounts";
import entriesRouter from "./entries";
import budgetsRouter from "./budgets";
import budgetItemsRouter from "./budgetItems";

const router = Router();

router.use("/categories", categoriesRouter);
router.use("/accounts", accountsRouter);
router.use("/entries", entriesRouter);
router.use("/budgets", budgetsRouter);
router.use("/budget-items", budgetItemsRouter);

export default router;
