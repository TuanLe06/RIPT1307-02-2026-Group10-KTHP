import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  sendManualNotification,
  sendNotificationToMultipleCandidates,
  getNotifications,
  getNotificationDetail,
  markNotificationAsRead,
  updateNotificationStatus,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getNotifications,
);
router.get(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid notification ID')],
  getNotificationDetail,
);

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

router.put('/:id/status', updateNotificationStatus);
router.put('/:id/read', markNotificationAsRead);

export default router;
