import { Router } from 'express';
import { budgetItemController } from '../controllers/budgetItemController';

const router = Router();

router.get('/budget/:budgetId', budgetItemController.getByBudgetId);
router.get('/:id', budgetItemController.getById);
router.post('/', budgetItemController.create);
router.put('/:id', budgetItemController.update);
router.delete('/:id', budgetItemController.delete);

export default router;
