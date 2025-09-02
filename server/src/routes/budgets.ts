import { Router } from "express";
import { budgetController } from "../controllers/budgetController";

const router = Router();

router.get("/", budgetController.getAll);
router.get("/current", budgetController.getCurrent);
router.get("/:id", budgetController.getById);
router.get("/:id/progress", budgetController.getProgress);
router.post("/", budgetController.create);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.delete);

export default router;