export interface LoginRequest {
  citizenId: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  citizenId: string;
  email: string;
  password: string;
}

export interface RegisterPayload {
  ho_ten: string;
  email: string;
  mat_khau: string;
  xac_nhan_mat_khau: string;
  so_cccd: string;
}

export type RegisterFormData = RegisterPayload;

export interface User {
  ma_nguoi_dung: number;
  email: string;
  ho_ten: string;
  vai_tro: 'THI_SINH' | 'QUAN_TRI_VIEN';
}

export interface AuthResponseData {
  ma_nguoi_dung: number;
  email: string;
  ho_ten: string;
  vai_tro: 'THI_SINH' | 'QUAN_TRI_VIEN';
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}
