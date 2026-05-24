import bcrypt from 'bcryptjs';
import pool, { testConnection } from '../config/database';

const seed = async (): Promise<void> => {
  await testConnection();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const candidatePassword = await bcrypt.hash('candidate123', 12);

  await pool.execute(
    `INSERT IGNORE INTO users (email, password_hash, role, status) VALUES
     ('admin@example.com', ?, 'ADMIN', 'ACTIVE'),
     ('candidate@example.com', ?, 'CANDIDATE', 'ACTIVE')`,
    [adminPassword, candidatePassword]
  );

  await pool.execute(
    `INSERT IGNORE INTO universities (code, name, address, phone, email, website, description, status) VALUES
     ('VNUHCM-US', 'Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM', '227 Nguyễn Văn Cừ, Quận 5, TP.HCM', '02838354466', 'info@hcmus.edu.vn', 'https://hcmus.edu.vn', 'Trường đại học đào tạo khối ngành khoa học cơ bản và công nghệ.', 'ACTIVE'),
     ('VNUHCM-UIT', 'Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM', 'Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP.HCM', '02837252002', 'info@uit.edu.vn', 'https://uit.edu.vn', 'Trường đại học chuyên sâu về công nghệ thông tin và truyền thông.', 'ACTIVE'),
     ('HCMUT', 'Trường Đại học Bách khoa - ĐHQG TP.HCM', '268 Lý Thường Kiệt, Quận 10, TP.HCM', '02838654087', 'info@hcmut.edu.vn', 'https://hcmut.edu.vn', 'Trường kỹ thuật trọng điểm với nhiều ngành công nghệ và kỹ thuật.', 'ACTIVE'),
     ('UEH', 'Trường Đại học Kinh tế TP.HCM', '59C Nguyễn Đình Chiểu, Quận 3, TP.HCM', '02838295299', 'contact@ueh.edu.vn', 'https://ueh.edu.vn', 'Trường đại học trọng điểm về kinh tế, quản trị và kinh doanh.', 'ACTIVE')`
  );

  await pool.execute(
    `INSERT IGNORE INTO majors (university_id, code, name, description, status)
     SELECT u.id, m.code, m.name, m.description, 'ACTIVE'
     FROM (
       SELECT 'VNUHCM-UIT' AS university_code, '7480201' AS code, 'Công nghệ thông tin' AS name, 'Đào tạo kỹ sư CNTT tổng quát.' AS description
       UNION ALL SELECT 'VNUHCM-UIT', '7480108', 'Khoa học dữ liệu', 'Đào tạo chuyên sâu phân tích dữ liệu, AI và học máy.'
       UNION ALL SELECT 'VNUHCM-UIT', '7480102', 'Mạng máy tính và truyền thông dữ liệu', 'Đào tạo về hạ tầng mạng, bảo mật và truyền thông.'
       UNION ALL SELECT 'VNUHCM-US', '7480101', 'Khoa học máy tính', 'Đào tạo nền tảng thuật toán, hệ thống và trí tuệ nhân tạo.'
       UNION ALL SELECT 'VNUHCM-US', '7460108', 'Khoa học dữ liệu', 'Đào tạo phân tích dữ liệu phục vụ khoa học và doanh nghiệp.'
       UNION ALL SELECT 'HCMUT', '7520216', 'Kỹ thuật điều khiển và tự động hóa', 'Đào tạo kỹ sư điều khiển, robot và hệ thống tự động.'
       UNION ALL SELECT 'HCMUT', '7480106', 'Kỹ thuật máy tính', 'Đào tạo phần cứng, nhúng và hệ thống máy tính.'
       UNION ALL SELECT 'UEH', '7340101', 'Quản trị kinh doanh', 'Đào tạo quản trị doanh nghiệp, chiến lược và vận hành.'
       UNION ALL SELECT 'UEH', '7340201', 'Tài chính - Ngân hàng', 'Đào tạo nghiệp vụ tài chính, ngân hàng và đầu tư.'
       UNION ALL SELECT 'UEH', '7340122', 'Thương mại điện tử', 'Đào tạo kinh doanh số, marketing số và vận hành TMĐT.'
     ) m
     INNER JOIN universities u ON u.code = m.university_code`
  );

  await pool.execute(
    `INSERT IGNORE INTO admission_combinations (code, subject_1, subject_2, subject_3) VALUES
     ('A00', 'Toán', 'Vật lý', 'Hóa học'),
     ('A01', 'Toán', 'Vật lý', 'Tiếng Anh'),
     ('D01', 'Toán', 'Ngữ văn', 'Tiếng Anh'),
     ('D07', 'Toán', 'Hóa học', 'Tiếng Anh'),
     ('B00', 'Toán', 'Hóa học', 'Sinh học'),
     ('C00', 'Ngữ văn', 'Lịch sử', 'Địa lý')`
  );

  await pool.execute(
    `INSERT IGNORE INTO major_combinations (major_id, combination_id, min_score, status)
     SELECT m.id, c.id, mc.min_score, 'ACTIVE'
     FROM (
       SELECT '7480201' AS major_code, 'A00' AS combination_code, 24.0 AS min_score
       UNION ALL SELECT '7480201', 'A01', 24.5
       UNION ALL SELECT '7480108', 'A00', 25.0
       UNION ALL SELECT '7480108', 'A01', 25.5
       UNION ALL SELECT '7480102', 'A00', 23.0
       UNION ALL SELECT '7480102', 'A01', 23.5
       UNION ALL SELECT '7480101', 'A00', 24.5
       UNION ALL SELECT '7480101', 'A01', 25.0
       UNION ALL SELECT '7460108', 'A00', 24.0
       UNION ALL SELECT '7460108', 'D01', 23.5
       UNION ALL SELECT '7520216', 'A00', 23.0
       UNION ALL SELECT '7520216', 'A01', 23.5
       UNION ALL SELECT '7480106', 'A00', 24.0
       UNION ALL SELECT '7480106', 'A01', 24.5
       UNION ALL SELECT '7340101', 'A01', 22.0
       UNION ALL SELECT '7340101', 'D01', 22.5
       UNION ALL SELECT '7340201', 'A01', 23.0
       UNION ALL SELECT '7340201', 'D01', 23.5
       UNION ALL SELECT '7340122', 'D01', 22.0
       UNION ALL SELECT '7340122', 'A01', 22.5
     ) mc
     INNER JOIN majors m ON m.code = mc.major_code
     INNER JOIN admission_combinations c ON c.code = mc.combination_code`
  );

  console.log('Seed data inserted');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  Candidate: candidate@example.com / candidate123');
  console.log('  Universities/Majors/Combinations: inserted');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
