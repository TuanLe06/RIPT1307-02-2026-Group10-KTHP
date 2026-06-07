import { Router, type Router as ExpressRouter } from 'express';
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
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

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
      .customSanitizer((value) => String(value ?? '').trim())
      .notEmpty()
      .withMessage('CCCD không được để trống')
      .matches(/^\d{12}$/)
      .withMessage('Số CCCD phải gồm 12 chữ số'),
    body('full_name').trim().notEmpty().withMessage('Họ tên không được để trống'),
    emailRule(),
    passwordRules(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email không được để trống').normalizeEmail(),
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

const changePasswordRules = () =>
  body('new_password')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .custom((value) => {
      if (value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[^a-zA-Z0-9]/.test(value)) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.');
      }
      return true;
    });

router.put(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
    changePasswordRules(),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
  ],
  changePassword
);

export default router;
