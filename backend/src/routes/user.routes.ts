
import { Router } from 'express';
import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import {
  deleteMyAvatar,
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  updateUser,
  uploadMyAvatar,
} from '../controllers/user.controller';

import { authenticate, authorize } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Chỉ chấp nhận ảnh JPEG/PNG/WebP/GIF'));
      return;
    }
    cb(null, true);
  },
});

const avatarUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  avatarUpload.single('avatar')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'Upload avatar thất bại',
    });
  });
};

router.use(authenticate);

router.get('/me', getMe);
router.post('/me/avatar', avatarUploadMiddleware, uploadMyAvatar);
router.delete('/me/avatar', deleteMyAvatar);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', authorize('ADMIN'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
