export const AUTH_ERRORS = {
  REQUIRED: 'Vui lòng điền đầy đủ thông tin',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_MIN: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  CCCD_INVALID: 'Số CCCD phải gồm 12 chữ số',
  EMAIL_EXISTS: 'Email này đã được đăng ký',
  REGISTER_FAILED: 'Đăng ký thất bại, vui lòng thử lại',
} as const;

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
} as const;
