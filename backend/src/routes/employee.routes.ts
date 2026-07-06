import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.getAll);
router.post('/import', employeeController.bulkImport);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.deactivate);

export default router;