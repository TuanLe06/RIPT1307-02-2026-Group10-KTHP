# Mermaid ERD - Thiết kế CSDL vật lý

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR_255 email UK
        VARCHAR_255 password_hash
        VARCHAR_255 full_name
        VARCHAR_20 role
        VARCHAR_20 status
        DATETIME last_login_at
        DATETIME created_at
        DATETIME updated_at
    }

    PASSWORD_RESET_TOKENS {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR_255 token UK
        DATETIME expires_at
        DATETIME used_at
        DATETIME created_at
    }

    UNIVERSITIES {
        BIGINT id PK
        VARCHAR_50 code UK
        VARCHAR_255 name
        TEXT address
        VARCHAR_20 phone
        VARCHAR_255 email
        VARCHAR_255 website
        TEXT description
        VARCHAR_20 status
        DATETIME created_at
        DATETIME updated_at
    }

    MAJORS {
        BIGINT id PK
        BIGINT university_id FK
        VARCHAR_50 code
        VARCHAR_255 name
        TEXT description
        VARCHAR_20 status
        DATETIME created_at
        DATETIME updated_at
    }

    ADMISSION_COMBINATIONS {
        BIGINT id PK
        VARCHAR_20 code UK
        VARCHAR_100 subject_1
        VARCHAR_100 subject_2
        VARCHAR_100 subject_3
        DATETIME created_at
    }

    MAJOR_COMBINATIONS {
        BIGINT id PK
        BIGINT major_id FK
        BIGINT combination_id FK
        DECIMAL_4_2 min_score
        VARCHAR_20 status
    }

    CANDIDATE_PROFILES {
        BIGINT citizen_id PK
        BIGINT user_id FK
        VARCHAR_255 full_name
        VARCHAR_20 phone
        DATE date_of_birth
        VARCHAR_20 gender
        DATE citizen_issue_date
        VARCHAR_255 citizen_issue_place
        VARCHAR_20 religion
        DATE dob
        VARCHAR_20 nation
        VARCHAR_255 province
        VARCHAR_255 ward
        TEXT address
        DATETIME created_at
        DATETIME updated_at
    }

    APPLICATIONS {
        BIGINT id PK
        BIGINT candidate_id FK
        VARCHAR_50 application_code UK
        BIGINT university_id FK
        BIGINT major_id FK
        BIGINT combination_id FK
        VARCHAR_50 status
        DATETIME submitted_at
        BIGINT reviewed_by FK
        DATETIME reviewed_at
        TEXT reject_reason
        DATETIME created_at
        DATETIME updated_at
    }

    ACADEMIC_RECORDS {
        BIGINT id PK
        BIGINT candidate_id FK
        INT graduation_year
        DECIMAL_4_2 subject_1_score
        DECIMAL_4_2 subject_2_score
        DECIMAL_4_2 subject_3_score
        DECIMAL_5_2 total_score
        DECIMAL_4_2 priority_score
        DECIMAL_5_2 final_score
        DATETIME created_at
        DATETIME updated_at
    }

    ACADEMIC_PROGRESS {
        BIGINT id PK
        BIGINT record_id FK
        INT grade_level
        VARCHAR_255 school_name
        DECIMAL_4_2 avg_score
    }

    CANDIDATE_DOCUMENTS {
        BIGINT id PK
        BIGINT candidate_id FK
        VARCHAR_50 document_type
        VARCHAR_255 file_name
        TEXT file_url
        VARCHAR_20 file_type
        BIGINT file_size
        DATETIME uploaded_at
        DATETIME deleted_at
    }

    APPLICATION_STATUS_LOGS {
        BIGINT id PK
        BIGINT application_id FK
        VARCHAR_50 old_status
        VARCHAR_50 new_status
        BIGINT changed_by FK
        TEXT note
        DATETIME created_at
    }

    EMAIL_NOTIFICATIONS {
        BIGINT id PK
        BIGINT receiver_id FK
        VARCHAR_255 receiver_email
        VARCHAR_255 subject
        TEXT content
        VARCHAR_50 type
        VARCHAR_20 status
        BIGINT sent_by FK
        DATETIME sent_at
        TEXT error_message
        DATETIME created_at
    }

    AUDIT_LOGS {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR_100 action
        VARCHAR_100 table_name
        BIGINT record_id
        JSON old_data
        JSON new_data
        VARCHAR_50 ip_address
        TEXT user_agent
        DATETIME created_at
    }

    USERS ||--o{ PASSWORD_RESET_TOKENS : co_token_reset
    UNIVERSITIES ||--o{ MAJORS : co_nganh
    MAJORS ||--o{ MAJOR_COMBINATIONS : anh_xa
    ADMISSION_COMBINATIONS ||--o{ MAJOR_COMBINATIONS : anh_xa
    USERS ||--|| CANDIDATE_PROFILES : so_huu_ho_so
    USERS ||--o{ APPLICATIONS : nop_ho_so
    UNIVERSITIES ||--o{ APPLICATIONS : nhan_ho_so
    MAJORS ||--o{ APPLICATIONS : dang_ky_nganh
    ADMISSION_COMBINATIONS ||--o{ APPLICATIONS : su_dung_to_hop
    USERS ||--o{ APPLICATIONS : duyet_ho_so
    CANDIDATE_PROFILES ||--|| ACADEMIC_RECORDS : co_hoc_ba
    ACADEMIC_RECORDS ||--o{ ACADEMIC_PROGRESS : gom_tien_trinh
    CANDIDATE_PROFILES ||--o{ CANDIDATE_DOCUMENTS : tai_len_tai_lieu
    APPLICATIONS ||--o{ APPLICATION_STATUS_LOGS : co_lich_su
    USERS ||--o{ APPLICATION_STATUS_LOGS : thay_doi_trang_thai
    USERS ||--o{ EMAIL_NOTIFICATIONS : nhan_email
    USERS ||--o{ EMAIL_NOTIFICATIONS : gui_email
    USERS ||--o{ AUDIT_LOGS : tao_nhat_ky
```

## Giá trị Enum
- `user_role`: `CANDIDATE`, `ADMIN`
- `user_status`: `ACTIVE`, `LOCKED`, `PENDING`
- `common_status`: `ACTIVE`, `INACTIVE`
- `gender`: `MALE`, `FEMALE`, `OTHER`
- `application_status`: `DRAFT`, `SUBMITTED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PASSED`, `FAILED`
- `document_type`: `TRANSCRIPT`, `CITIZEN_ID`, `PORTRAIT`, `CERTIFICATE`, `OTHER`
- `file_type`: `PDF`, `JPEG`, `PNG`
- `email_type`: `APPLICATION_SUBMITTED`, `STATUS_CHANGED`, `MANUAL`, `PASSWORD_RESET`
- `email_status`: `PENDING`, `SENT`, `FAILED`

## Ghi chú ràng buộc
- Khóa unique của `majors`: (`university_id`, `code`)
- Khóa unique của `major_combinations`: (`major_id`, `combination_id`)
- `academic_records.candidate_id` là unique
- `candidate_profiles` đang có cả `date_of_birth` và `dob` theo schema hiện tại
