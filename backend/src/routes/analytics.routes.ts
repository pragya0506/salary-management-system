import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/by-department', analyticsController.getByDepartment);
router.get('/by-country', analyticsController.getByCountry);

export default router;