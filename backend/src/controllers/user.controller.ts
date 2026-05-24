import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { full_name, role, status } = req.body;
  const user = await UserModel.update(Number(req.params.id), { full_name, role, status });
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
