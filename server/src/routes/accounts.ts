import { Router } from "express";
import { accountController } from "../controllers/accountController";

const router = Router();

router.get("/", accountController.getAll);
router.get("/net-worth", accountController.getNetWorth);
router.get("/distribution", accountController.getDistribution);
router.get("/:id", accountController.getById);
router.post("/", accountController.create);
router.put("/:id", accountController.update);
router.delete("/:id", accountController.delete);

export default router;