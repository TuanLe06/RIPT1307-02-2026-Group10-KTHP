import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const PASSWORD_RULES_MSG =
  'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.';

const passwordRules = () =>
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .custom((value) => {
      if (value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[^a-zA-Z0-9]/.test(value)) {
        throw new Error(PASSWORD_RULES_MSG);
      }
      return true;
    });

const emailRule = () =>
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail();

router.post(
  '/register',
  [
    body('citizen_id')
      .isInt({ gt: 0 })
      .withMessage('CCCD phải là số nguyên dương'),
    body('full_name').trim().notEmpty().withMessage('Họ tên không được để trống'),
    emailRule(),
    passwordRules(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email không được để trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
  ],
  login
);

router.post(
  '/forgot-password',
  [emailRule()],
  forgotPassword
);

router.post(
  '/resend-otp',
  [emailRule()],
  resendOtp
);

router.post(
  '/verify-otp',
  [
    emailRule(),
    body('otp').notEmpty().withMessage('Mã OTP là bắt buộc'),
  ],
  verifyOtp
);

router.post(
  '/reset-password',
  [
    emailRule(),
    body('otp').notEmpty().withMessage('Mã OTP là bắt buộc'),
    passwordRules(),
  ],
  resetPassword
);

router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;
