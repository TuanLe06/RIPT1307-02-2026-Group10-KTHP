import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllCombinationsGlobal,
  getAllCombinationsList,
  createCombinationGlobal,
  updateCombinationGlobal,
  deleteCombinationGlobal,
} from '../controllers/admissionCombination.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
  ],
  getAllCombinationsGlobal,
);

router.get(
  '/list',
  authenticate,
  authorize('ADMIN'),
  getAllCombinationsList,
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('code').trim().notEmpty().withMessage('Mã tổ hợp không được để trống'),
    body('subject_1').trim().notEmpty().withMessage('Môn 1 không được để trống'),
    body('subject_2').trim().notEmpty().withMessage('Môn 2 không được để trống'),
    body('subject_3').trim().notEmpty().withMessage('Môn 3 không được để trống'),
  ],
  createCombinationGlobal,
);

router.put(
  '/:combinationId',
  authenticate,
  authorize('ADMIN'),
  [
    param('combinationId').trim().matches(/^TH\d{6}$/i).withMessage('ID phải theo định dạng THXXXXXX (6 số)'),
    body('code').optional().trim().notEmpty().withMessage('Mã tổ hợp không được để trống'),
    body('subject_1').optional().trim().notEmpty().withMessage('Môn 1 không được để trống'),
    body('subject_2').optional().trim().notEmpty().withMessage('Môn 2 không được để trống'),
    body('subject_3').optional().trim().notEmpty().withMessage('Môn 3 không được để trống'),
  ],
  updateCombinationGlobal,
);

router.delete(
  '/:combinationId',
  authenticate,
  authorize('ADMIN'),
  [
    param('combinationId').trim().matches(/^TH\d{6}$/i).withMessage('ID phải theo định dạng THXXXXXX (6 số)'),
  ],
  deleteCombinationGlobal,
);

export default router;
