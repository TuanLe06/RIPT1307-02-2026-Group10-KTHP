import { Router, type Router as ExpressRouter } from 'express';
import { param, body } from 'express-validator';
import {
  getAssignedCombinations,
  assignCombinations,
} from '../controllers/combinationAssignment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router: ExpressRouter = Router({ mergeParams: true });

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
  ],
  getAssignedCombinations,
);

router.put(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    body('combination_ids').isArray().withMessage('Danh sách tổ hợp không hợp lệ'),
  ],
  assignCombinations,
);

export default router;
