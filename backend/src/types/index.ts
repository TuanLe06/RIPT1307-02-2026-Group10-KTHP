export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: 'CANDIDATE' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CandidateProfile {
  citizen_id: number;
  user_id: number;
  full_name: string;
  phone?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
