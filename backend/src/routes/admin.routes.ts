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
    body('science_group')
      .exists()
      .withMessage('science_group is required')
      .isIn(['NATURAL', 'SOCIAL'])
      .withMessage('science_group is invalid'),
    body('scores').exists().withMessage('scores is required').isObject().withMessage('scores must be an object'),
    body().custom((value) => {
      const group = value?.science_group;
      const scores = value?.scores;
      if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return true;
      const expected =
        group === 'NATURAL'
          ? ['TOAN', 'VAN', 'ANH', 'LY', 'HOA', 'SINH']
          : group === 'SOCIAL'
            ? ['TOAN', 'VAN', 'ANH', 'SU', 'DIA', 'GDCD']
            : [];
      if (!expected.length) return true;
      const keys = Object.keys(scores).sort();
      const expectedKeys = [...expected].sort();
      if (keys.length !== expectedKeys.length || keys.some((key, idx) => key !== expectedKeys[idx])) {
        throw new Error(`scores must contain exactly: ${expected.join(', ')}`);
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
