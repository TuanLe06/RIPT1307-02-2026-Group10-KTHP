import { Router, type Router as ExpressRouter } from 'express';
import { query } from 'express-validator';
import {
  getOverallStatistics,
  getStatisticsByUniversity,
  getStatisticsByMajor,
  getStatisticsByStatus,
  getStatisticsByDateRange,
  getDetailedReport,
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/statistics/overall', getOverallStatistics);
router.get('/statistics/by-university', getStatisticsByUniversity);
router.get('/statistics/by-major', getStatisticsByMajor);
router.get('/statistics/by-status', getStatisticsByStatus);
router.get(
  '/statistics/by-date-range',
  [
    query('start_date').notEmpty().withMessage('start_date is required'),
    query('end_date').notEmpty().withMessage('end_date is required'),
  ],
  getStatisticsByDateRange,
);
router.get(
  '/detailed',
  [
    query('university_id').optional().isInt({ min: 1 }),
    query('major_id').optional().isInt({ min: 1 }),
  ],
  getDetailedReport,
);

export default router;
