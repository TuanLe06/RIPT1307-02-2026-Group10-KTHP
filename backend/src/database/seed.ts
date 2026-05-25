import bcrypt from "bcryptjs";
import pool, { testConnection } from "../config/database";

const seed = async (): Promise<void> => {
  await testConnection();

  await pool.execute("SET FOREIGN_KEY_CHECKS = 0");
  const tables = [
    "audit_logs", "email_notifications", "application_status_logs",
    "candidate_documents", "exam_scores", "academic_progress",
    "academic_records", "applications", "candidate_profiles",
    "major_combinations", "majors", "admission_combinations",
    "universities", "password_reset_tokens", "users",
  ];
  for (const table of tables) {
    await pool.execute(`TRUNCATE TABLE ${table}`);
  }
  await pool.execute("SET FOREIGN_KEY_CHECKS = 1");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const candidatePassword = await bcrypt.hash("candidate123", 12);

  await pool.execute(
    `INSERT IGNORE INTO users (email, password_hash, role, status) VALUES
     ('admin@example.com', ?, 'ADMIN', 'ACTIVE'),
     ('candidate@example.com', ?, 'CANDIDATE', 'ACTIVE')`,
    [adminPassword, candidatePassword],
  );

  await pool.execute(
    `INSERT IGNORE INTO universities (id, code, name, address, phone, email, website, description, status) VALUES
     ('DH000001', 'VNUHCM-US', 'Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM', '227 Nguyễn Văn Cừ, Quận 5, TP.HCM', '02838354466', 'info@hcmus.edu.vn', 'https://hcmus.edu.vn', 'Trường đại học đào tạo khối ngành khoa học cơ bản và công nghệ.', 'ACTIVE'),
     ('DH000002', 'VNUHCM-UIT', 'Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM', 'Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP.HCM', '02837252002', 'info@uit.edu.vn', 'https://uit.edu.vn', 'Trường đại học chuyên sâu về công nghệ thông tin và truyền thông.', 'ACTIVE'),
     ('DH000003', 'HCMUT', 'Trường Đại học Bách khoa - ĐHQG TP.HCM', '268 Lý Thường Kiệt, Quận 10, TP.HCM', '02838654087', 'info@hcmut.edu.vn', 'https://hcmut.edu.vn', 'Trường kỹ thuật trọng điểm với nhiều ngành công nghệ và kỹ thuật.', 'ACTIVE'),
     ('DH000004', 'UEH', 'Trường Đại học Kinh tế TP.HCM', '59C Nguyễn Đình Chiểu, Quận 3, TP.HCM', '02838295299', 'contact@ueh.edu.vn', 'https://ueh.edu.vn', 'Trường đại học trọng điểm về kinh tế, quản trị và kinh doanh.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT IGNORE INTO majors (id, university_id, code, name, description, status) VALUES
     -- UIT (DH000002)
     ('NH000001', 'DH000002', '7480201', 'Công nghệ thông tin', 'Đào tạo kỹ sư CNTT tổng quát.', 'ACTIVE'),
     ('NH000002', 'DH000002', '7480108', 'Khoa học dữ liệu', 'Đào tạo chuyên sâu phân tích dữ liệu, AI và học máy.', 'ACTIVE'),
     ('NH000003', 'DH000002', '7480102', 'Mạng máy tính và truyền thông dữ liệu', 'Đào tạo về hạ tầng mạng, bảo mật và truyền thông.', 'ACTIVE'),
     -- US (DH000001)
     ('NH000004', 'DH000001', '7480101', 'Khoa học máy tính', 'Đào tạo nền tảng thuật toán, hệ thống và trí tuệ nhân tạo.', 'ACTIVE'),
     ('NH000005', 'DH000001', '7460108', 'Khoa học dữ liệu', 'Đào tạo phân tích dữ liệu phục vụ khoa học và doanh nghiệp.', 'ACTIVE'),
     -- HCMUT (DH000003)
     ('NH000006', 'DH000003', '7520216', 'Kỹ thuật điều khiển và tự động hóa', 'Đào tạo kỹ sư điều khiển, robot và hệ thống tự động.', 'ACTIVE'),
     ('NH000007', 'DH000003', '7480106', 'Kỹ thuật máy tính', 'Đào tạo phần cứng, nhúng và hệ thống máy tính.', 'ACTIVE'),
     -- UEH (DH000004)
     ('NH000008', 'DH000004', '7340101', 'Quản trị kinh doanh', 'Đào tạo quản trị doanh nghiệp, chiến lược và vận hành.', 'ACTIVE'),
     ('NH000009', 'DH000004', '7340201', 'Tài chính - Ngân hàng', 'Đào tạo nghiệp vụ tài chính, ngân hàng và đầu tư.', 'ACTIVE'),
     ('NH000010', 'DH000004', '7340122', 'Thương mại điện tử', 'Đào tạo kinh doanh số, marketing số và vận hành TMĐT.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT IGNORE INTO admission_combinations (id, code, subject_1, subject_2, subject_3) VALUES
     -- Khoi A
     ('TH000001', 'A00', 'Toan', 'Ly', 'Hoa'),
     ('TH000002', 'A01', 'Toan', 'Ly', 'Anh'),
     ('TH000003', 'A02', 'Toan', 'Ly', 'Sinh'),
     ('TH000004', 'A03', 'Toan', 'Ly', 'Su'),
     ('TH000005', 'A04', 'Toan', 'Ly', 'Dia'),
     ('TH000006', 'A05', 'Toan', 'Hoa', 'Su'),
     ('TH000007', 'A06', 'Toan', 'Hoa', 'Dia'),
     ('TH000008', 'A07', 'Toan', 'Su', 'Dia'),
     ('TH000009', 'A08', 'Toan', 'Su', 'GDKT&PL'),
     -- Khoi B
     ('TH000010', 'B00', 'Toan', 'Hoa', 'Sinh'),
     ('TH000011', 'B01', 'Toan', 'Sinh', 'Su'),
     ('TH000012', 'B02', 'Toan', 'Sinh', 'Dia'),
     ('TH000013', 'B03', 'Toan', 'Van', 'Sinh'),
     -- Khoi C
     ('TH000014', 'C00', 'Van', 'Su', 'Dia'),
     ('TH000015', 'C01', 'Toan', 'Van', 'Ly'),
     ('TH000016', 'C02', 'Toan', 'Van', 'Hoa'),
     ('TH000017', 'C03', 'Toan', 'Van', 'Su'),
     ('TH000018', 'C04', 'Toan', 'Van', 'Dia'),
     ('TH000019', 'C05', 'Van', 'Ly', 'Hoa'),
     ('TH000020', 'C06', 'Van', 'Ly', 'Sinh'),
     ('TH000021', 'C07', 'Van', 'Ly', 'Su'),
     ('TH000022', 'C08', 'Van', 'Hoa', 'Sinh'),
     ('TH000023', 'C09', 'Van', 'Ly', 'Dia'),
     ('TH000024', 'C10', 'Van', 'Hoa', 'Su'),
     ('TH000025', 'C12', 'Van', 'Sinh', 'Su'),
     ('TH000026', 'C13', 'Van', 'Sinh', 'Dia'),
     ('TH000027', 'C14', 'Toan', 'Van', 'GDKT&PL'),
     -- Khoi D
     ('TH000028', 'D01', 'Van', 'Toan', 'Anh'),
     ('TH000029', 'D02', 'Van', 'Toan', 'Nga'),
     ('TH000030', 'D03', 'Van', 'Toan', 'Phap'),
     ('TH000031', 'D04', 'Van', 'Toan', 'Trung'),
     ('TH000032', 'D07', 'Toan', 'Hoa', 'Anh'),
     ('TH000033', 'D08', 'Toan', 'Sinh', 'Anh'),
     ('TH000034', 'D09', 'Toan', 'Su', 'Anh'),
     ('TH000035', 'D10', 'Toan', 'Dia', 'Anh'),
     ('TH000036', 'D14', 'Van', 'Su', 'Anh'),
     ('TH000037', 'D15', 'Van', 'Dia', 'Anh')`
  );

  await pool.execute(
    `INSERT IGNORE INTO major_combinations (major_id, combination_id)
     SELECT m.id, ac.id
     FROM majors m
     CROSS JOIN admission_combinations ac`
  );

  console.log("Seed data inserted");
  console.log("  Admin: admin@example.com / admin123");
  console.log("  Candidate: candidate@example.com / candidate123");
  console.log("  Universities/Majors/Combinations: inserted");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
