import { Router, type Router as ExpressRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  createApplication,
  submitApplication,
  getApplications,
  getApplicationDetails,
  getApplicationStatus,
  deleteApplication,
  getDeadlineInfo,
} from '../controllers/application.controller';
import {
  getNotifications,
  getNotificationDetail,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requireCompleteProfile, getProfileCompletenessHandler } from '../middleware/requireCompleteProfile.middleware';

const router: ExpressRouter = Router();

// Deadline info - public
router.get('/deadline', getDeadlineInfo);

// Apply authentication middleware - these routes require candidate login
router.use(authenticate);

// Profile completeness check
router.get('/profile/completeness', getProfileCompletenessHandler);

// ===================== APPLICATION MANAGEMENT (CANDIDATE) =====================

router.post(
  '/applications',
  [
    body('university_id').matches(/^DH\d{6}$/i).withMessage('University ID is required (DHxxxxxx)'),
    body('major_id').matches(/^NH\d{6}$/i).withMessage('Major ID is required (NHxxxxxx)'),
    body('combination_id').matches(/^TH\d{6}$/i).withMessage('Combination ID is required (THxxxxxx)'),
    body('subject_1_score').optional({ values: 'null' }).isFloat({ min: 0, max: 10 }).withMessage('subject_1_score must be between 0 and 10'),
    body('subject_2_score').optional({ values: 'null' }).isFloat({ min: 0, max: 10 }).withMessage('subject_2_score must be between 0 and 10'),
    body('subject_3_score').optional({ values: 'null' }).isFloat({ min: 0, max: 10 }).withMessage('subject_3_score must be between 0 and 10'),
  ],
  requireCompleteProfile,
  createApplication
);

router.post(
  '/applications/:application_id/submit',
  [param('application_id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  requireCompleteProfile,
  submitApplication
);

router.get(
  '/applications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getApplications
);

router.get(
  '/applications/:application_id',
  [param('application_id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  getApplicationDetails
);

router.get(
  '/applications/:application_id/status',
  [param('application_id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  getApplicationStatus
);

router.delete(
  '/applications/:application_id',
  [param('application_id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  deleteApplication
);

// ===================== NOTIFICATIONS (CANDIDATE) =====================

router.get(
  '/notifications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getNotifications
);

router.get(
  '/notifications/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid notification ID')],
  getNotificationDetail
);

export default router;
