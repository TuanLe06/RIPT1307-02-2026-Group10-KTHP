export interface University {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface Major {
  id: string;
  university_id: string;
  code: string;
  name: string;
  description: string | null;
  min_score: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface AdmissionCombination {
  id: string;
  code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
  created_at: string;
}

export interface MajorCombination {
  major_id: string;
  combination_id: string;
  min_score: number | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PASSED'
  | 'FAILED';

export interface Application {
  id: number;
  candidate_id: number;
  application_code: string;
  university_id: string;
  major_id: string;
  combination_id: string;
  status: ApplicationStatus;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
}
