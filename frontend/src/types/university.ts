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

export interface ApplicationWithDetails extends Application {
  university_name: string;
  university_code: string;
  major_name: string;
  major_code: string;
  candidate_name: string;
  candidate_email: string;
  reviewer_name?: string;
}

export interface CandidateProfileFull {
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
    last_login_at: string | null;
  };
  candidate_profile: {
    citizen_id: number;
    full_name: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    citizen_issue_date: string | null;
    citizen_issue_place: string | null;
    religion: string | null;
    ethnic: string | null;
    nation: string | null;
    province: string | null;
    ward: string | null;
    address: string | null;
  };
}

export interface ExamScoreItem {
  subject_code: string;
  subject_name: string;
  is_required: boolean;
  score: number;
}

export interface AcademicRecordFull {
  academic_record: {
    id: number | null;
    candidate_id: number;
    graduation_year: number | null;
    priority_score: number;
    exam_scores: ExamScoreItem[];
    foreign_language: { language_code: string; language_name: string } | null;
  } | null;
  academic_progress: {
    grade_10: { school_name?: string | null; avg_score?: number | null };
    grade_11: { school_name?: string | null; avg_score?: number | null };
    grade_12: { school_name?: string | null; avg_score?: number | null };
  };
}

export interface CandidateDocumentItem {
  id: number;
  document_type: string;
  file_name: string;
  display_name: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface CombinationDetail {
  id: string;
  code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
}

export interface ApplicationDetailData extends ApplicationWithDetails {
  status_logs: StatusLog[];
  candidate_profile: CandidateProfileFull | null;
  academic_record: AcademicRecordFull | null;
  documents: CandidateDocumentItem[];
  combination: CombinationDetail | null;
}

export interface StatusLog {
  id: number;
  application_id: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  changed_by_name?: string;
  note: string;
  created_at: string;
}

export interface StatusStat {
  status: string;
  count: number;
  percentage: number;
  status_display: string;
}
