import { Router } from 'express';
import { body } from 'express-validator';
import {
  sendManualNotification,
  sendNotificationToMultipleCandidates,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.post(
  '/send',
  [
    body('receiver_id').isInt({ gt: 0 }).withMessage('Receiver ID is required'),
    body('receiver_email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('type').optional().trim(),
  ],
  sendManualNotification,
);

router.post(
  '/send-bulk',
  [
    body('university_id').optional().isInt({ min: 1 }),
    body('major_id').optional().isInt({ min: 1 }),
    body('status')
      .optional()
      .isIn(['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED']),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  sendNotificationToMultipleCandidates,
);

export default router;
