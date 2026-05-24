import bcrypt from 'bcryptjs';
import pool, { testConnection } from '../config/database';

const seed = async (): Promise<void> => {
  await testConnection();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const candidatePassword = await bcrypt.hash('candidate123', 12);

  await pool.execute(
    `INSERT IGNORE INTO users (email, password_hash, full_name, role, status) VALUES
     ('admin@example.com', ?, 'Admin User', 'ADMIN', 'ACTIVE'),
     ('candidate@example.com', ?, 'Candidate User', 'CANDIDATE', 'ACTIVE')`,
    [adminPassword, candidatePassword]
  );

  await pool.execute(
    `INSERT IGNORE INTO universities (id, code, name, address, phone, email, website, description)
     VALUES
     ('DH000001', 'HUST', 'Dai hoc Bach khoa Ha Noi', 'Ha Noi', '02438521933', 'info@hust.edu.vn', 'https://hust.edu.vn', 'Truong cong nghe hang dau'),
     ('DH000002', 'UIT', 'Dai hoc Cong nghe Thong tin TP HCM', 'Thu Duc, TP HCM', '02873018218', 'info@uit.edu.vn', 'https://uit.edu.vn', 'Truong cong nghe thong tin')
     ON DUPLICATE KEY UPDATE code = code`
  );

  await pool.execute(
    `INSERT IGNORE INTO admission_combinations (id, code, subject_1, subject_2, subject_3) VALUES
     (1, 'A00', 'Toan', 'Ly', 'Hoa'),
     (2, 'A01', 'Toan', 'Ly', 'Anh'),
     (3, 'B00', 'Toan', 'Hoa', 'Sinh'),
     (4, 'C00', 'Van', 'Su', 'Dia')
    ON DUPLICATE KEY UPDATE code = code`
  );

  await pool.execute(
    `INSERT IGNORE INTO majors (id, university_id, admission_combinations_id, code, name, description, min_score)
     SELECT 'NH000001', 'DH000001', 1, 'CNTT', 'Cong nghe thong tin', 'Nganh CNTT', 22.50
     FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM majors WHERE id = 'NH000001')`
  );

  console.log('🌱 Seed data inserted');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Candidate: candidate@example.com / candidate123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
