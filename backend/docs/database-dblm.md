Enum user_role {
  CANDIDATE
  ADMIN
}

Enum user_status {
  ACTIVE
  LOCKED
  PENDING
}

Enum active_status {
  ACTIVE
  INACTIVE
}

Enum gender_enum {
  MALE
  FEMALE
  OTHER
}

Enum application_status {
  DRAFT
  SUBMITTED
  PENDING_REVIEW
  APPROVED
  REJECTED
  PASSED
  FAILED
}

Enum subject_code_enum {
  TOAN
  VAN
  LY
  HOA
  SINH
  SU
  DIA
  GDKTPL
  TINHOC
  CONGNGHE
  NGOAINGU
}

Enum language_code_enum {
  ANH
  PHAP
  DUC
  NHAT
  HAN
  NGA
  TRUNG
}

Enum document_type_enum {
  TRANSCRIPT
  CITIZEN_ID_Front
  CITIZEN_ID_Back
  PORTRAIT
  CERTIFICATE
  EXAM_CERTIFICATE
  OTHER
}

Enum file_type_enum {
  PDF
  JPEG
  PNG
}

Enum verify_status {
  PENDING
  VERIFIED
  FAILED
}

Enum overall_verify_status {
  UNVERIFIED
  PARTIAL
  VERIFIED
  FAILED
}

Enum email_type_enum {
  APPLICATION_SUBMITTED
  STATUS_CHANGED
  MANUAL
  PASSWORD_RESET
}

Enum email_status_enum {
  PENDING
  SENT
  FAILED
  READ
}

Table users {
  id bigint [pk, increment]
  email varchar(255) [not null, unique]
  password_hash varchar(255) [not null]
  role user_role [not null]
  status user_status [not null, default: 'ACTIVE']
  avatar_url varchar(500)
  avatar_public_id varchar(255)
  last_login_at datetime
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Table password_reset_tokens {
  id bigint [pk, increment]
  user_id bigint [not null]
  token varchar(255) [not null, unique]
  expires_at datetime [not null]
  used_at datetime
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    user_id
  }
}

Table universities {
  id varchar(20) [pk]
  code varchar(50) [not null]
  name varchar(255) [not null]
  address text
  phone varchar(20)
  email varchar(255)
  website varchar(255)
  description text
  status active_status [not null, default: 'ACTIVE']
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    code
  }
}

Table majors {
  id varchar(20) [pk]
  university_id varchar(20) [not null]
  code varchar(50) [not null]
  name varchar(255) [not null]
  description text
  min_score decimal(4,2)
  status active_status [not null, default: 'ACTIVE']
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    (university_id, code)
    university_id
  }
}

Table admission_combinations {
  id varchar(20) [pk]
  code varchar(20) [not null, unique]
  subject_1 varchar(100) [not null]
  subject_2 varchar(100) [not null]
  subject_3 varchar(100) [not null]
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Table major_combinations {
  id bigint [pk, increment]
  major_id varchar(20) [not null]
  combination_id varchar(20) [not null]
  min_score decimal(4,2)
  status active_status [not null, default: 'ACTIVE']

  indexes {
    (major_id, combination_id) [unique]
    major_id
    combination_id
  }
}

Table candidate_profiles {
  citizen_id varchar(20) [pk]
  user_id bigint [not null, unique]
  full_name varchar(255) [not null]
  phone varchar(20)
  date_of_birth date
  gender gender_enum
  citizen_issue_date date
  citizen_issue_place varchar(255)
  religion varchar(20)
  ethnic varchar(20)
  nation varchar(20)
  province varchar(255)
  ward varchar(255)
  address text
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Table applications {
  id bigint [pk, increment]
  candidate_id varchar(20) [not null]
  application_code varchar(50) [not null, unique]
  university_id varchar(20) [not null]
  major_id varchar(20) [not null]
  combination_id varchar(20) [not null]
  status application_status [not null, default: 'DRAFT']
  submitted_at datetime
  reviewed_by bigint
  reviewed_at datetime
  reject_reason text
  subject_1_score decimal(4,2)
  subject_2_score decimal(4,2)
  subject_3_score decimal(4,2)
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    candidate_id
    status
    university_id
    major_id
    combination_id
    reviewed_by
  }
}

Table academic_records {
  id bigint [pk, increment]
  candidate_id varchar(20) [not null, unique]
  graduation_year int
  total_score decimal(5,2)
  priority_score decimal(4,2) [not null, default: 0]
  final_score decimal(5,2)
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Table academic_progress {
  id bigint [pk, increment]
  record_id bigint [not null]
  grade_level int
  school_name varchar(255)
  avg_score decimal(4,2)

  indexes {
    record_id
  }
}

Table exam_scores {
  id bigint [pk, increment]
  record_id bigint [not null]
  subject_code subject_code_enum [not null]
  is_required boolean [not null, default: false, note: 'true = TOAN, VAN | false = mon tu chon']
  score decimal(4,2) [not null]
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    (record_id, subject_code) [unique]
    record_id
  }
}

Table foreign_language_scores {
  id bigint [pk, increment]
  record_id bigint [not null, unique, note: 'Chi co neu thi sinh chon NGOAINGU la mon tu chon']
  language_code language_code_enum [not null]
  language_name varchar(50) [not null]
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    record_id
  }
}

Table candidate_documents {
  id bigint [pk, increment]
  candidate_id varchar(20) [not null]
  document_type document_type_enum [not null]
  file_name varchar(255) [not null]
  display_name varchar(255)
  file_url text [not null]
  file_type file_type_enum [not null]
  file_size bigint
  uploaded_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  deleted_at datetime

  indexes {
    candidate_id
  }
}

Table candidate_identity_verifications {
  id bigint [pk, increment]
  user_id bigint [not null, unique]
  front_document_id bigint
  back_document_id bigint
  portrait_document_id bigint
  front_status verify_status [not null, default: 'PENDING']
  back_status verify_status [not null, default: 'PENDING']
  face_status verify_status [not null, default: 'PENDING']
  overall_status overall_verify_status [not null, default: 'UNVERIFIED']
  similarity decimal(5,2)
  failure_reason varchar(255)
  verified_at datetime
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    overall_status
    front_document_id
    back_document_id
    portrait_document_id
  }
}

Table application_status_logs {
  id bigint [pk, increment]
  application_id bigint [not null]
  old_status varchar(50)
  new_status varchar(50) [not null]
  changed_by bigint
  note text
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    application_id
    changed_by
  }
}

Table email_notifications {
  id bigint [pk, increment]
  receiver_id bigint
  receiver_email varchar(255) [not null]
  subject varchar(255) [not null]
  content text [not null]
  type email_type_enum [not null]
  status email_status_enum [not null, default: 'PENDING']
  sent_by bigint
  sent_at datetime
  error_message text
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    status
    receiver_id
    sent_by
  }
}

Table audit_logs {
  id bigint [pk, increment]
  user_id bigint
  action varchar(100) [not null]
  table_name varchar(100)
  record_id bigint
  old_data json
  new_data json
  ip_address varchar(50)
  user_agent text
  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]

  indexes {
    user_id
  }
}

/* Relationships */

Ref: password_reset_tokens.user_id > users.id

Ref: majors.university_id > universities.id

Ref: major_combinations.major_id > majors.id
Ref: major_combinations.combination_id > admission_combinations.id

Ref: candidate_profiles.user_id > users.id

Ref: applications.candidate_id > candidate_profiles.citizen_id
Ref: applications.university_id > universities.id
Ref: applications.major_id > majors.id
Ref: applications.combination_id > admission_combinations.id
Ref: applications.reviewed_by > users.id

Ref: academic_records.candidate_id > candidate_profiles.citizen_id

Ref: academic_progress.record_id > academic_records.id

Ref: exam_scores.record_id > academic_records.id

Ref: foreign_language_scores.record_id > academic_records.id

Ref: candidate_documents.candidate_id > candidate_profiles.citizen_id

Ref: candidate_identity_verifications.user_id > users.id
Ref: candidate_identity_verifications.front_document_id > candidate_documents.id
Ref: candidate_identity_verifications.back_document_id > candidate_documents.id
Ref: candidate_identity_verifications.portrait_document_id > candidate_documents.id

Ref: application_status_logs.application_id > applications.id
Ref: application_status_logs.changed_by > users.id

Ref: email_notifications.receiver_id > users.id
Ref: email_notifications.sent_by > users.id

Ref: audit_logs.user_id > users.id