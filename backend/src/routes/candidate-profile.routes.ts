import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  deleteCandidateDocument,
  getCandidateAcademicRecord,
  getCandidateProfile,
  listCandidateDocuments,
  uploadCandidateDocument,
  upsertCandidateAcademicProgress,
  upsertCandidateAcademicRecord,
  updateCandidateProfile,
} from '../controllers/candidate-profile.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Unsupported file type. Only PDF/JPEG/PNG allowed'));
      return;
    }
    cb(null, true);
  },
});
const uploadDocumentMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'File upload failed',
    });
  });
};

router.use(authenticate, authorize('CANDIDATE'));

router.get('/profile', getCandidateProfile);
router.get('/profile/academic-record', getCandidateAcademicRecord);
router.get('/profile/documents', listCandidateDocuments);
router.put(
  '/profile',
  [
    body('full_name').optional().trim().notEmpty().withMessage('full_name cannot be empty'),
    body('phone').optional().isString().isLength({ max: 20 }).withMessage('phone max length is 20'),
    body('date_of_birth').optional().isISO8601().withMessage('date_of_birth must be YYYY-MM-DD'),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('gender is invalid'),
    body('citizen_issue_date')
      .optional()
      .isISO8601()
      .withMessage('citizen_issue_date must be YYYY-MM-DD'),
    body('citizen_issue_place')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('citizen_issue_place max length is 255'),
    body('religion').optional().isString().isLength({ max: 20 }).withMessage('religion max length is 20'),
    body('ethnic').optional().isString().isLength({ max: 20 }).withMessage('ethnic max length is 20'),
    body('nation').optional().isString().isLength({ max: 20 }).withMessage('nation max length is 20'),
    body('province').optional().isString().isLength({ max: 255 }).withMessage('province max length is 255'),
    body('ward').optional().isString().isLength({ max: 255 }).withMessage('ward max length is 255'),
    body('address').optional().isString().withMessage('address must be string'),
  ],
  updateCandidateProfile
);
router.put(
  '/profile/academic-record',
  [
    body('graduation_year')
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('graduation_year must be a valid year'),
    body('priority_score')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('priority_score must be between 0 and 10'),
  ],
  upsertCandidateAcademicRecord
);
router.put(
  '/profile/academic-progress',
  [
    body('grade_10').optional().isObject().withMessage('grade_10 must be an object'),
    body('grade_11').optional().isObject().withMessage('grade_11 must be an object'),
    body('grade_12').optional().isObject().withMessage('grade_12 must be an object'),
    body('grade_10.school_name')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('grade_10.school_name max length is 255'),
    body('grade_11.school_name')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('grade_11.school_name max length is 255'),
    body('grade_12.school_name')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('grade_12.school_name max length is 255'),
    body('grade_10.avg_score')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('grade_10.avg_score must be between 0 and 10'),
    body('grade_11.avg_score')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('grade_11.avg_score must be between 0 and 10'),
    body('grade_12.avg_score')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('grade_12.avg_score must be between 0 and 10'),
  ],
  upsertCandidateAcademicProgress
);
router.post(
  '/profile/documents',
  uploadDocumentMiddleware,
  [
    body('document_type')
      .exists()
      .withMessage('document_type is required')
      .isIn(['TRANSCRIPT', 'CITIZEN_ID_Front', 'CITIZEN_ID_Back', 'PORTRAIT', 'CERTIFICATE', 'OTHER'])
      .withMessage('document_type is invalid'),
  ],
  uploadCandidateDocument
);
router.delete('/profile/documents/:documentId', deleteCandidateDocument);

export default router;
