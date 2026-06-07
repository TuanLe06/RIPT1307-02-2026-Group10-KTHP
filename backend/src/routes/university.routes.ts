import { Router, type Router as ExpressRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getUniversities,
  getUniversityDetail,
  createMajor,
  updateMajor,
  deleteMajor,
  getMajorsByUniversity,
  getMajorDetail,
} from '../controllers/university.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// ── Universities ──────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Mã trường (viết tắt) không được để trống'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  createUniversity
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [
    param('id').trim().matches(/^DH\d{6}$/i).withMessage('ID phải theo định dạng DHXXXXXX (6 số)'),
    body('code')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Mã trường (viết tắt) không được để trống'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  updateUniversity
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').trim().matches(/^DH\d{6}$/i).withMessage('ID phải theo định dạng DHXXXXXX (6 số)')],
  deleteUniversity
);

router.get(
  '/',
  [
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
  ],
  getUniversities
);

router.get(
  '/:code',
  [param('code').trim().notEmpty().withMessage('Mã trường không được để trống')],
  getUniversityDetail
);

// ── Majors ────────────────────────────────────────────────────
router.post(
  '/:universityId/majors',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityId').trim().matches(/^DH\d{6}$/i).withMessage('University ID phải theo định dạng DHXXXXXX'),
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Mã ngành (viết tắt) không được để trống'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('min_score').optional({ values: 'null' }).isDecimal().withMessage('Min score must be a decimal number'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  createMajor
);

router.put(
  '/:universityId/majors/:majorId',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityId').trim().matches(/^DH\d{6}$/i).withMessage('University ID phải theo định dạng DHXXXXXX'),
    param('majorId').trim().matches(/^NH\d{6}$/i).withMessage('Major ID phải theo định dạng NHXXXXXX'),
    body('code')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Mã ngành (viết tắt) không được để trống'),
    body('name').optional().trim().notEmpty(),
    body('min_score').optional({ values: 'null' }).isDecimal(),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ],
  updateMajor
);

router.delete(
  '/:universityId/majors/:majorId',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityId').trim().matches(/^DH\d{6}$/i).withMessage('University ID phải theo định dạng DHXXXXXX'),
    param('majorId').trim().matches(/^NH\d{6}$/i).withMessage('Major ID phải theo định dạng NHXXXXXX'),
  ],
  deleteMajor
);

router.get(
  '/:universityCode/majors',
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
  ],
  getMajorsByUniversity
);

router.get(
  '/:universityCode/majors/:code',
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('code').trim().notEmpty().withMessage('Mã ngành không được để trống'),
  ],
  getMajorDetail
);

export default router;
