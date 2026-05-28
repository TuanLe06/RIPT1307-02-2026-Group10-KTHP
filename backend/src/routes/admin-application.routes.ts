import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listApplications,
  getApplicationDetailAdmin,
  updateApplicationStatus,
} from '../controllers/admin-application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', listApplications);

router.get(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  getApplicationDetailAdmin,
);

router.put(
  '/:id/status',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid application ID'),
    body('status')
      .isIn(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'])
      .withMessage('Invalid status'),
    body('reject_reason').optional().trim(),
  ],
  updateApplicationStatus,
);

export default router;
