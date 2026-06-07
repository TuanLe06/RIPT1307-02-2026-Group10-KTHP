import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { AUTH_ERRORS, AUTH_MESSAGES } from '../constants/auth';
import { UserModel } from '../models/user.model';
import { sendOtpEmail } from '../services/email.service';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp.util';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) throw new Error('JWT secret is not configured');
  return secret;
};

function getOtpExpiry(): Date {
  const minutes = parseInt(process.env.OTP_EXPIRES_IN || '5', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

function getCooldownSeconds(): number {
  return parseInt(process.env.OTP_RESEND_COOLDOWN || '60', 10);
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

const { citizen_id, full_name, email, password } = req.body as {
     citizen_id: string;
     full_name: string;
     email: string;
     password: string;
   };

  if (await UserModel.existsByEmail(email)) {
    res.status(409).json({
      success: false,
      message: 'Email đã tồn tại',
      code: AUTH_ERRORS.EMAIL_EXISTS,
    });
    return;
  }

if (await UserModel.existsCandidateByCitizenId(citizen_id)) {
     res.status(409).json({
       success: false,
       message: 'Số CCCD đã tồn tại',
       code: AUTH_ERRORS.CITIZEN_ID_EXISTS,
     });
     return;
   }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
const user = await UserModel.createCandidateWithProfile({
       citizen_id: citizen_id,
       full_name: full_name.trim(),
       email: email.toLowerCase().trim(),
       password_hash: passwordHash,
     });

    res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      data: user,
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Thông tin đăng ký đã tồn tại',
        code: AUTH_ERRORS.CITIZEN_ID_EXISTS,
      });
      return;
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { email, password } = req.body as { email: string; password: string };
  const identifier = email.trim();

let user = await UserModel.findAuthByEmail(identifier.toLowerCase());
   if (!user && /^\d+$/.test(identifier)) {
     user = await UserModel.findAuthByCitizenId(identifier);
   }
  if (!user) {
    res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.INVALID_CREDENTIALS,
      code: AUTH_ERRORS.INVALID_CREDENTIALS,
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.INVALID_CREDENTIALS,
      code: AUTH_ERRORS.INVALID_CREDENTIALS,
    });
    return;
  }

  if (user.status === 'LOCKED') {
    res.status(403).json({
      success: false,
      message: AUTH_MESSAGES.ACCOUNT_LOCKED,
      code: AUTH_ERRORS.ACCOUNT_LOCKED,
    });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  await UserModel.touchLastLoginAt(user.id);
  const profile = await UserModel.findById(user.id);

  res.json({
    success: true,
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: { token, user: profile },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { email } = req.body as { email: string };

  try {
    const user = await UserModel.findAuthByEmail(email.toLowerCase().trim());
    if (!user) {
      res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOtpExpiry();
    await UserModel.saveResetToken(user.id, hashedOtp, expiresAt);

    const sent = await sendOtpEmail(email, otp, user.email, user.id);
    if (!sent) {
      res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.OTP_SEND_FAILED,
        code: AUTH_ERRORS.OTP_INVALID,
      });
      return;
    }

    res.json({
      success: true,
      message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { email } = req.body as { email: string };

  try {
    const user = await UserModel.findAuthByEmail(email.toLowerCase().trim());
    if (!user) {
      res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const lastToken = await UserModel.getLastResetToken(user.id);
    if (lastToken) {
      const elapsed = (Date.now() - new Date(lastToken.created_at).getTime()) / 1000;
      if (elapsed < getCooldownSeconds()) {
        const remaining = Math.ceil(getCooldownSeconds() - elapsed);
        res.status(429).json({
          success: false,
          message: `Vui lòng đợi ${remaining} giây trước khi yêu cầu gửi lại mã.`,
          code: AUTH_ERRORS.RESEND_COOLDOWN,
          data: { remaining },
        });
        return;
      }
    }

    const recentCount = await UserModel.countRecentTokens(user.id, 60);
    if (recentCount >= 5) {
      res.status(429).json({
        success: false,
        message: AUTH_MESSAGES.RESEND_LIMIT_EXCEEDED,
        code: AUTH_ERRORS.RESEND_LIMIT_EXCEEDED,
      });
      return;
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOtpExpiry();
    await UserModel.saveResetToken(user.id, hashedOtp, expiresAt);

    const sent = await sendOtpEmail(email, otp, user.email, user.id);
    if (!sent) {
      res.status(500).json({
        success: false,
        message: AUTH_MESSAGES.OTP_SEND_FAILED,
        code: AUTH_ERRORS.OTP_INVALID,
      });
      return;
    }

    res.json({
      success: true,
      message: AUTH_MESSAGES.RESEND_OTP_SUCCESS,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { email, otp } = req.body as { email: string; otp: string };

  try {
    const user = await UserModel.findAuthByEmail(email.toLowerCase().trim());
    if (!user) {
      res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const tokens = await UserModel.findValidResetTokens(user.id);
    let matched = false;
    for (const t of tokens) {
      if (await verifyOTP(otp, t.token)) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      res.status(400).json({
        success: false,
        message: AUTH_MESSAGES.OTP_INVALID,
        code: AUTH_ERRORS.OTP_INVALID,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Mã OTP hợp lệ.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { email, otp, password } = req.body as { email: string; otp: string; password: string };

  try {
    const user = await UserModel.findAuthByEmail(email.toLowerCase().trim());
    if (!user) {
      res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const tokens = await UserModel.findValidResetTokens(user.id);
    let matchedToken: string | null = null;
    for (const t of tokens) {
      if (await verifyOTP(otp, t.token)) {
        matchedToken = t.token;
        break;
      }
    }
    if (!matchedToken) {
      res.status(400).json({
        success: false,
        message: AUTH_MESSAGES.OTP_INVALID,
        code: AUTH_ERRORS.OTP_INVALID,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await UserModel.updatePassword(user.id, passwordHash);
    await UserModel.markResetTokenUsed(matchedToken);

    res.json({
      success: true,
      message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      code: AUTH_ERRORS.VALIDATION_FAILED,
      errors: errors.array(),
    });
    return;
  }

  const { current_password, new_password } = req.body as {
    current_password: string;
    new_password: string;
  };

  try {
    const user = await UserModel.findAuthById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND,
        code: AUTH_ERRORS.USER_NOT_FOUND,
      });
      return;
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
        code: AUTH_ERRORS.INVALID_CREDENTIALS,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(new_password, 12);
    await UserModel.updatePassword(user.id, passwordHash);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: AUTH_MESSAGES.LOGOUT_SUCCESS,
  });
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
};
