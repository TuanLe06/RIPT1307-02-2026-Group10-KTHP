import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { uploadImageBuffer, deleteImageByPublicId } from '../services/cloudinary.service';
import { ensureCloudinaryConfigured } from '../config/cloudinary';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { users, total } = await UserModel.findAll(page, limit);

  res.json({
    success: true,
    data: users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(Number(req.params.id));
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
};

export const uploadMyAvatar = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh' });
    return;
  }

  const userId = req.user!.id;
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  try {
    if (process.env.CLOUDINARY_DISABLED !== 'true') {
      ensureCloudinaryConfigured();
    }
    const uploaded = await uploadImageBuffer(req.file.buffer, {
      folder: `admisx/avatars/${userId}`,
      publicId: `avatar-${userId}`,
    });

    const oldPublicId = currentUser.avatar_public_id;
    if (oldPublicId && oldPublicId !== uploaded.publicId) {
      try {
        await deleteImageByPublicId(oldPublicId);
      } catch (err) {
        console.warn('Failed to delete old avatar on Cloudinary:', err);
      }
    }

    const updated = await UserModel.updateAvatar(userId, {
      avatar_url: uploaded.secureUrl,
      avatar_public_id: uploaded.publicId,
    });

    res.json({
      success: true,
      message: 'Cập nhật avatar thành công',
      data: updated,
    });
  } catch (err) {
    console.error('uploadMyAvatar error:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Upload avatar thất bại',
    });
  }
};

export const deleteMyAvatar = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (currentUser.avatar_public_id) {
    try {
      await deleteImageByPublicId(currentUser.avatar_public_id);
    } catch (err) {
      console.warn('Failed to delete avatar on Cloudinary:', err);
    }
  }

  const updated = await UserModel.clearAvatar(userId);
  res.json({
    success: true,
    message: 'Đã xoá avatar',
    data: updated,
  });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { role, status } = req.body;
  const user = await UserModel.update(Number(req.params.id), { role, status });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User updated', data: user });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const deleted = await UserModel.delete(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User deleted' });
};
