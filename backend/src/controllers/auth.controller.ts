import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { AUTH_ERRORS, AUTH_MESSAGES } from '../constants/auth';
import { UserModel } from '../models/user.model';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) throw new Error('JWT secret is not configured');
  return secret;
};

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
    citizen_id: number;
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

  if (await UserModel.existsCandidateByCitizenId(Number(citizen_id))) {
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
      citizenId: Number(citizen_id),
      fullName: full_name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
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
    user = await UserModel.findAuthByCitizenId(Number(identifier));
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
