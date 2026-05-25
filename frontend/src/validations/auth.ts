import { z } from 'zod';

export const registerSchema = z
  .object({
    ho_ten: z
      .string('Vui lòng nhập họ tên')
      .min(1, 'Vui lòng nhập họ tên')
      .max(100, 'Họ tên không được quá 100 ký tự'),
    email: z
      .string('Vui lòng nhập email')
      .email('Email không hợp lệ'),
    so_cccd: z
      .string('Vui lòng nhập số CCCD')
      .regex(/^\d{12}$/, 'Số CCCD phải gồm 12 chữ số'),
    mat_khau: z
      .string('Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    xac_nhan_mat_khau: z
      .string('Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.mat_khau === data.xac_nhan_mat_khau, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xac_nhan_mat_khau'],
  });

export const loginSchema = z.object({
  so_cccd: z
    .string('Vui lòng nhập số CCCD')
    .min(1, 'Vui lòng nhập số CCCD'),
  mat_khau: z
    .string('Vui lòng nhập mật khẩu')
    .min(1, 'Vui lòng nhập mật khẩu'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
