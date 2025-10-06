import { Router } from 'express';
import { entryController } from '../controllers/entryController';

const router = Router();

router.get('/', entryController.getAll);
router.get('/stats', entryController.getStats);
router.get('/recent', entryController.getRecent);
router.get('/:id', entryController.getById);
router.post('/', entryController.create);
router.put('/:id', entryController.update);
router.delete('/:id', entryController.delete);

export default router;
