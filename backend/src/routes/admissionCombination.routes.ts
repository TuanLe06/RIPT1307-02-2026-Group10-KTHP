import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCombination,
  updateCombination,
  deleteCombination,
  getCombinations,
  getCombinationDetail,
} from '../controllers/admissionCombination.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Mã tổ hợp không được để trống'),
    body('subject_1')
      .trim()
      .notEmpty()
      .withMessage('Môn 1 không được để trống'),
    body('subject_2')
      .trim()
      .notEmpty()
      .withMessage('Môn 2 không được để trống'),
    body('subject_3')
      .trim()
      .notEmpty()
      .withMessage('Môn 3 không được để trống'),
  ],
  createCombination,
);

router.put(
  '/:combinationId',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    param('combinationId').trim().matches(/^TH\d{6}$/i).withMessage('ID phải theo định dạng THXXXXXX (6 số)'),
    body('code')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Mã tổ hợp không được để trống'),
    body('subject_1')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Môn 1 không được để trống'),
    body('subject_2')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Môn 2 không được để trống'),
    body('subject_3')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Môn 3 không được để trống'),
  ],
  updateCombination,
);

router.delete(
  '/:combinationId',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    param('combinationId').trim().matches(/^TH\d{6}$/i).withMessage('ID phải theo định dạng THXXXXXX (6 số)'),
  ],
  deleteCombination,
);

router.get(
  '/',
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
  ],
  getCombinations,
);

router.get(
  '/:combinationId',
  authenticate,
  authorize('ADMIN'),
  [
    param('universityCode').trim().notEmpty().withMessage('Mã trường không được để trống'),
    param('majorCode').trim().notEmpty().withMessage('Mã ngành không được để trống'),
    param('combinationId').trim().matches(/^TH\d{6}$/i).withMessage('ID phải theo định dạng THXXXXXX (6 số)'),
  ],
  getCombinationDetail,
);

export default router;
