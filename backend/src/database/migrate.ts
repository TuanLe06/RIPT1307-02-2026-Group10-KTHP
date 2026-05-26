import pool, { testConnection } from '../config/database';

const migrate = async (): Promise<void> => {
  await testConnection();

  const queries = [
    `SET FOREIGN_KEY_CHECKS = 0`,
    `DROP TABLE IF EXISTS audit_logs`,
    `DROP TABLE IF EXISTS email_notifications`,
    `DROP TABLE IF EXISTS application_status_logs`,
    `DROP TABLE IF EXISTS candidate_documents`,
    `DROP TABLE IF EXISTS exam_scores`,
    `DROP TABLE IF EXISTS academic_progress`,
    `DROP TABLE IF EXISTS academic_records`,
    `DROP TABLE IF EXISTS applications`,
    `DROP TABLE IF EXISTS candidate_profiles`,
    `DROP TABLE IF EXISTS major_combinations`,
    `DROP TABLE IF EXISTS majors`,
    `DROP TABLE IF EXISTS admission_combinations`,
    `DROP TABLE IF EXISTS universities`,
    `DROP TABLE IF EXISTS password_reset_tokens`,
    `DROP TABLE IF EXISTS users`,
    `SET FOREIGN_KEY_CHECKS = 1`,

    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('CANDIDATE','ADMIN') NOT NULL,
      status ENUM('ACTIVE','LOCKED','PENDING') NOT NULL DEFAULT 'ACTIVE',
      last_login_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_prt_token (token),
      KEY idx_prt_user_id (user_id),
      CONSTRAINT fk_prt_user
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS universities (
      id VARCHAR(20) PRIMARY KEY,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      address TEXT NULL,
      phone VARCHAR(20) NULL,
      email VARCHAR(255) NULL,
      website VARCHAR(255) NULL,
      description TEXT NULL,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_universities_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS majors (
      id VARCHAR(20) PRIMARY KEY,
      university_id VARCHAR(20) NOT NULL,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      min_score DECIMAL(4,2) NULL,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_majors_university_code (university_id, code),
      KEY idx_majors_university_id (university_id),
      CONSTRAINT fk_majors_university
        FOREIGN KEY (university_id) REFERENCES universities(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS admission_combinations (
      id VARCHAR(20) PRIMARY KEY,
      code VARCHAR(20) NOT NULL,
      subject_1 VARCHAR(100) NOT NULL,
      subject_2 VARCHAR(100) NOT NULL,
      subject_3 VARCHAR(100) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_admission_combination_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS major_combinations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      major_id VARCHAR(20) NOT NULL,
      combination_id VARCHAR(20) NOT NULL,
      min_score DECIMAL(4,2) NULL,
      status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      UNIQUE KEY uq_major_combination (major_id, combination_id),
      KEY idx_mc_major_id (major_id),
      KEY idx_mc_combination_id (combination_id),
      CONSTRAINT fk_mc_major
        FOREIGN KEY (major_id) REFERENCES majors(id),
      CONSTRAINT fk_mc_combination
        FOREIGN KEY (combination_id) REFERENCES admission_combinations(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS candidate_profiles (
      citizen_id BIGINT UNSIGNED PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NULL,
      date_of_birth DATE NULL,
      gender ENUM('MALE','FEMALE','OTHER') NULL,
      citizen_issue_date DATE NULL,
      citizen_issue_place VARCHAR(255) NULL,
      religion VARCHAR(20) NULL,
      ethnic VARCHAR(20) NULL,
      nation VARCHAR(20) NULL,
      province VARCHAR(255) NULL,
      ward VARCHAR(255) NULL,
      address TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_candidate_profiles_user_id (user_id),
      CONSTRAINT fk_candidate_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS applications (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      candidate_id BIGINT UNSIGNED NOT NULL,
      application_code VARCHAR(50) NOT NULL,
      university_id VARCHAR(20) NOT NULL,
      major_id VARCHAR(20) NOT NULL,
      combination_id VARCHAR(20) NOT NULL,
      status ENUM('DRAFT','SUBMITTED','PENDING_REVIEW','APPROVED','REJECTED','PASSED','FAILED') NOT NULL DEFAULT 'DRAFT',
      submitted_at DATETIME NULL,
      reviewed_by BIGINT UNSIGNED NULL,
      reviewed_at DATETIME NULL,
      reject_reason TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_applications_code (application_code),
      KEY idx_app_candidate_id (candidate_id),
      KEY idx_app_status (status),
      KEY idx_app_university_id (university_id),
      KEY idx_app_major_id (major_id),
      KEY idx_app_combination_id (combination_id),
      KEY idx_app_reviewed_by (reviewed_by),
      CONSTRAINT fk_app_candidate
        FOREIGN KEY (candidate_id) REFERENCES users(id),
      CONSTRAINT fk_app_university
        FOREIGN KEY (university_id) REFERENCES universities(id),
      CONSTRAINT fk_app_major
        FOREIGN KEY (major_id) REFERENCES majors(id),
      CONSTRAINT fk_app_combination
        FOREIGN KEY (combination_id) REFERENCES admission_combinations(id),
      CONSTRAINT fk_app_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS academic_records (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      candidate_id BIGINT UNSIGNED NOT NULL,
      graduation_year INT NULL,
      science_group ENUM('NATURAL','SOCIAL') NULL,
      subject_1_score DECIMAL(4,2) NULL,
      subject_2_score DECIMAL(4,2) NULL,
      subject_3_score DECIMAL(4,2) NULL,
      total_score DECIMAL(5,2) NULL,
      priority_score DECIMAL(4,2) NOT NULL DEFAULT 0,
      final_score DECIMAL(5,2) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_academic_records_candidate_id (candidate_id),
      CONSTRAINT fk_academic_records_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(citizen_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS academic_progress (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      record_id BIGINT UNSIGNED NOT NULL,
      grade_level INT NULL,
      school_name VARCHAR(255) NULL,
      avg_score DECIMAL(4,2) NULL,
      KEY idx_academic_progress_record_id (record_id),
      CONSTRAINT fk_academic_progress_record
        FOREIGN KEY (record_id) REFERENCES academic_records(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS exam_scores (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      record_id BIGINT UNSIGNED NOT NULL,
      subject_code VARCHAR(20) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      score DECIMAL(4,2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_exam_scores_record_subject (record_id, subject_code),
      KEY idx_exam_scores_record_id (record_id),
      CONSTRAINT fk_exam_scores_record
        FOREIGN KEY (record_id) REFERENCES academic_records(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS candidate_documents (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      candidate_id BIGINT UNSIGNED NOT NULL,
      document_type ENUM('TRANSCRIPT','CITIZEN_ID','PORTRAIT','CERTIFICATE','OTHER') NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_type ENUM('PDF','JPEG','PNG') NOT NULL,
      file_size BIGINT NULL,
      uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME NULL,
      KEY idx_candidate_documents_candidate_id (candidate_id),
      CONSTRAINT fk_candidate_documents_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(citizen_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS application_status_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      application_id BIGINT UNSIGNED NOT NULL,
      old_status VARCHAR(50) NULL,
      new_status VARCHAR(50) NOT NULL,
      changed_by BIGINT UNSIGNED NULL,
      note TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_asl_application_id (application_id),
      KEY idx_asl_changed_by (changed_by),
      CONSTRAINT fk_asl_application
        FOREIGN KEY (application_id) REFERENCES applications(id),
      CONSTRAINT fk_asl_changed_by
        FOREIGN KEY (changed_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS email_notifications (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      receiver_id BIGINT UNSIGNED NULL,
      receiver_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type ENUM('APPLICATION_SUBMITTED','STATUS_CHANGED','MANUAL','PASSWORD_RESET') NOT NULL,
      status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
      sent_by BIGINT UNSIGNED NULL,
      sent_at DATETIME NULL,
      error_message TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_email_notifications_status (status),
      KEY idx_email_notifications_receiver_id (receiver_id),
      KEY idx_email_notifications_sent_by (sent_by),
      CONSTRAINT fk_email_notifications_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id),
      CONSTRAINT fk_email_notifications_sent_by
        FOREIGN KEY (sent_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NULL,
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NULL,
      record_id BIGINT NULL,
      old_data JSON NULL,
      new_data JSON NULL,
      ip_address VARCHAR(50) NULL,
      user_agent TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_audit_logs_user_id (user_id),
      CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const query of queries) {
    await pool.execute(query);
    console.log('Migration executed');
  }

  console.log('All migrations completed');
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
