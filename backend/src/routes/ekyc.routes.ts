import { Router, type Router as ExpressRouter } from 'express';
import { body } from 'express-validator';
import {
  getCandidateEkycStatus,
  verifyCandidateCitizenIdBack,
  verifyCandidateCitizenIdFront,
  verifyCandidatePortrait,
} from '../controllers/ekyc.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

router.use(authenticate, authorize('CANDIDATE'));

router.get('/status', getCandidateEkycStatus);
router.post(
  '/front',
  [body('document_id').isInt({ gt: 0 }).withMessage('document_id must be a positive integer')],
  verifyCandidateCitizenIdFront
);
router.post(
  '/back',
  [body('document_id').isInt({ gt: 0 }).withMessage('document_id must be a positive integer')],
  verifyCandidateCitizenIdBack
);
router.post(
  '/verify',
  [
    body('front_document_id').isInt({ gt: 0 }).withMessage('front_document_id must be a positive integer'),
    body('portrait_document_id').isInt({ gt: 0 }).withMessage('portrait_document_id must be a positive integer'),
  ],
  verifyCandidatePortrait
);

export default router;
