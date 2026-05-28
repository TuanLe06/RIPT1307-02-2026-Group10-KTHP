export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: 'CANDIDATE' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface RegisterPayload {
  citizen_id: number;
  full_name: string;
  email: string;
  password: string;
}
