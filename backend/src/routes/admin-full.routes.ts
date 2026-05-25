import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createUniversity,
  updateUniversity,
  deleteUniversity,
  listUniversities,
  getUniversityDetails,
  createMajor,
  updateMajor,
  deleteMajor,
  listMajorsByUniversity,
  getMajorDetails,
} from '../controllers/catalog-management.controller';
import {
  createAdmissionCombination,
  listAdmissionCombinations,
  addCombinationToMajor,
  updateMajorCombination,
  removeCombinationFromMajor,
  listCombinationsByMajor,
} from '../controllers/combination.controller';
import {
  listApplications,
  searchApplications,
  filterApplications,
  getApplicationDetailAdmin,
  updateApplicationStatus,
} from '../controllers/admin-application.controller';
import {
  sendManualNotification,
  sendNotificationToMultipleCandidates,
} from '../controllers/notification.controller';
import {
  getStatisticsByUniversity,
  getStatisticsByMajor,
  getStatisticsByStatus,
  getOverallStatistics,
  getStatisticsByDateRange,
  getDetailedReport,
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication and authorization middleware
router.use(authenticate, authorize('ADMIN'));

// ===================== UNIVERSITY MANAGEMENT =====================
router.post(
  '/universities',
  [
    body('code').trim().notEmpty().withMessage('University code is required'),
    body('name').trim().notEmpty().withMessage('University name is required'),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('email').optional().isEmail(),
    body('website').optional().trim(),
    body('description').optional().trim(),
  ],
  createUniversity
);

router.put(
  '/universities/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid university ID'),
    body('name').optional().trim().notEmpty(),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('email').optional().isEmail(),
    body('website').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  updateUniversity
);

router.delete(
  '/universities/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid university ID')],
  deleteUniversity
);

router.get(
  '/universities',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  listUniversities
);

router.get(
  '/universities/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid university ID')],
  getUniversityDetails
);

// ===================== MAJOR MANAGEMENT =====================
router.post(
  '/majors',
  [
    body('university_id').isInt({ gt: 0 }).withMessage('University ID is required'),
    body('code').trim().notEmpty().withMessage('Major code is required'),
    body('name').trim().notEmpty().withMessage('Major name is required'),
    body('description').optional().trim(),
  ],
  createMajor
);

router.put(
  '/majors/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid major ID'),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  updateMajor
);

router.delete(
  '/majors/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid major ID')],
  deleteMajor
);

router.get(
  '/universities/:university_id/majors',
  [
    param('university_id').isInt({ gt: 0 }).withMessage('Invalid university ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  listMajorsByUniversity
);

router.get(
  '/majors/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid major ID')],
  getMajorDetails
);

// ===================== ADMISSION COMBINATION MANAGEMENT =====================
router.post(
  '/admission-combinations',
  [
    body('code').trim().notEmpty().withMessage('Combination code is required'),
    body('subject_1').trim().notEmpty().withMessage('Subject 1 is required'),
    body('subject_2').trim().notEmpty().withMessage('Subject 2 is required'),
    body('subject_3').trim().notEmpty().withMessage('Subject 3 is required'),
  ],
  createAdmissionCombination
);

router.get(
  '/admission-combinations',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  listAdmissionCombinations
);

// ===================== MAJOR COMBINATION MANAGEMENT =====================
router.post(
  '/major-combinations',
  [
    body('major_id').isInt({ gt: 0 }).withMessage('Major ID is required'),
    body('combination_id').isInt({ gt: 0 }).withMessage('Combination ID is required'),
    body('min_score').isFloat({ min: 0, max: 30 }).withMessage('Min score must be between 0 and 30'),
  ],
  addCombinationToMajor
);

router.put(
  '/major-combinations/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid major combination ID'),
    body('min_score').optional().isFloat({ min: 0, max: 30 }),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  updateMajorCombination
);

router.delete(
  '/major-combinations/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid major combination ID')],
  removeCombinationFromMajor
);

router.get(
  '/majors/:major_id/combinations',
  [param('major_id').isInt({ gt: 0 }).withMessage('Invalid major ID')],
  listCombinationsByMajor
);

// ===================== APPLICATION MANAGEMENT =====================
router.get(
  '/applications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('university_id').optional().isInt({ min: 1 }),
    query('major_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED']),
    query('search').optional().trim(),
  ],
  listApplications
);

router.post(
  '/applications/search',
  [
    body('university_id').optional().isInt({ min: 1 }),
    body('major_id').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED']),
    body('keyword').optional().trim(),
  ],
  searchApplications
);

router.post(
  '/applications/filter',
  [
    body('university_id').optional().isInt({ min: 1 }),
    body('major_id').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED']),
  ],
  filterApplications
);

router.get(
  '/applications/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid application ID')],
  getApplicationDetailAdmin
);

router.put(
  '/applications/:id/status',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid application ID'),
    body('status')
      .isIn(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'])
      .withMessage('Invalid status'),
    body('reject_reason').optional().trim(),
  ],
  updateApplicationStatus
);

// ===================== NOTIFICATION MANAGEMENT =====================
router.post(
  '/notifications/send',
  [
    body('receiver_id').isInt({ gt: 0 }).withMessage('Receiver ID is required'),
    body('receiver_email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('type').optional().trim(),
  ],
  sendManualNotification
);

router.post(
  '/notifications/send-bulk',
  [
    body('university_id').optional().isInt({ min: 1 }),
    body('major_id').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED']),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  sendNotificationToMultipleCandidates
);

// ===================== REPORTS & STATISTICS =====================
router.get('/reports/statistics/overall', getOverallStatistics);

router.get(
  '/reports/statistics/by-university',
  getStatisticsByUniversity
);

router.get(
  '/reports/statistics/by-major',
  getStatisticsByMajor
);

router.get(
  '/reports/statistics/by-status',
  getStatisticsByStatus
);

router.get(
  '/reports/statistics/by-date-range',
  [
    query('start_date').notEmpty().withMessage('start_date is required'),
    query('end_date').notEmpty().withMessage('end_date is required'),
  ],
  getStatisticsByDateRange
);

router.get(
  '/reports/detailed',
  [
    query('university_id').optional().isInt({ min: 1 }),
    query('major_id').optional().isInt({ min: 1 }),
  ],
  getDetailedReport
);

export default router;
