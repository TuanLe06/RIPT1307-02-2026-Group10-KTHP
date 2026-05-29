import { Router } from 'express';
import { body, param } from 'express-validator';
import { upsertCandidateExamScoresByGroupAsAdmin } from '../controllers/candidate-profile.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.put(
  '/candidates/:citizenId/exam-scores-by-group',
  [
    param('citizenId').isInt({ min: 1 }).withMessage('citizenId must be a positive integer'),
    body('scores').exists().withMessage('scores is required').isObject().withMessage('scores must be an object'),
    body('foreign_language')
      .optional()
      .isObject()
      .withMessage('foreign_language must be an object'),
    body('foreign_language.language_code')
      .optional()
      .isIn(['ANH', 'PHAP', 'DUC', 'NHAT', 'HAN', 'NGA', 'TRUNG'])
      .withMessage('foreign_language.language_code is invalid'),
    body().custom((value) => {
      const scores = value?.scores;
      if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return true;
      const keys = Object.keys(scores);
      if (keys.length !== 4) {
        throw new Error('scores must contain exactly 4 subjects');
      }
      if (!keys.includes('TOAN') || !keys.includes('VAN')) {
        throw new Error('scores must include TOAN and VAN');
      }
      const optionalKeys = keys.filter((key) => key !== 'TOAN' && key !== 'VAN');
      const allowedOptional = ['LY', 'HOA', 'SINH', 'SU', 'DIA', 'GDKTPL', 'TINHOC', 'CONGNGHE', 'NGOAINGU'];
      if (optionalKeys.length !== 2 || optionalKeys.some((key) => !allowedOptional.includes(key))) {
        throw new Error(
          `scores optional subjects must be exactly 2 and in: ${allowedOptional.join(', ')}`
        );
      }

      const hasForeignLanguageSubject = keys.includes('NGOAINGU');
      const languageCode = value?.foreign_language?.language_code;
      if (hasForeignLanguageSubject && !languageCode) {
        throw new Error('foreign_language.language_code is required when NGOAINGU is selected');
      }
      if (!hasForeignLanguageSubject && value?.foreign_language) {
        throw new Error('foreign_language is only allowed when NGOAINGU is selected');
      }
      return true;
    }),
    body('scores.*')
      .isFloat({ min: 0, max: 10 })
      .withMessage('each score must be between 0 and 10'),
  ],
  upsertCandidateExamScoresByGroupAsAdmin
);

export default router;
