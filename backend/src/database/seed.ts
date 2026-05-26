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
     ('DH000001', 'HUST', 'Đại học Bách khoa Hà Nội', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', '02438695172', 'info@hust.edu.vn', 'https://hust.edu.vn', 'Trường đại học kỹ thuật hàng đầu Việt Nam, đào tạo đa ngành về kỹ thuật và công nghệ.', 'ACTIVE'),
     ('DH000002', 'HUS', 'Trường Đại học Khoa học Tự nhiên - ĐHQG Hà Nội', '334 Nguyễn Trãi, Thanh Xuân, Hà Nội', '02438581199', 'info@hus.edu.vn', 'https://hus.edu.vn', 'Trường đại học trọng điểm đào tạo các ngành khoa học cơ bản và công nghệ.', 'ACTIVE'),
     ('DH000003', 'UET', 'Trường Đại học Công nghệ - ĐHQG Hà Nội', '144 Xuân Thủy, Cầu Giấy, Hà Nội', '02437549154', 'info@uet.vnu.edu.vn', 'https://uet.vnu.edu.vn', 'Trường đại học chuyên sâu về công nghệ thông tin và kỹ thuật hiện đại.', 'ACTIVE'),
     ('DH000004', 'NEU', 'Trường Đại học Kinh tế Quốc dân', '207 Giải Phóng, Hai Bà Trưng, Hà Nội', '02436280407', 'info@neu.edu.vn', 'https://neu.edu.vn', 'Trường đại học trọng điểm quốc gia về đào tạo kinh tế, quản lý và quản trị kinh doanh.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT IGNORE INTO majors (id, university_id, code, name, description, status) VALUES
     -- HUST (DH000001)
     ('NH000001', 'DH000001', '7480201', 'Công nghệ thông tin', 'Đào tạo kỹ sư công nghệ thông tin tổng quát, chuyên sâu về phần mềm và hệ thống.', 'ACTIVE'),
     ('NH000002', 'DH000001', '7520216', 'Kỹ thuật điều khiển và tự động hóa', 'Đào tạo kỹ sư về điều khiển, robot và hệ thống tự động.', 'ACTIVE'),
     ('NH000003', 'DH000001', '7520107', 'Kỹ thuật điện tử viễn thông', 'Đào tạo kỹ sư điện tử, viễn thông và xử lý tín hiệu.', 'ACTIVE'),
     -- HUS (DH000002)
     ('NH000004', 'DH000002', '7480101', 'Khoa học máy tính', 'Đào tạo nền tảng thuật toán, hệ thống và trí tuệ nhân tạo.', 'ACTIVE'),
     ('NH000005', 'DH000002', '7460108', 'Khoa học dữ liệu', 'Đào tạo phân tích dữ liệu phục vụ khoa học và doanh nghiệp.', 'ACTIVE'),
     -- UET (DH000003)
     ('NH000006', 'DH000003', '7480106', 'Kỹ thuật máy tính', 'Đào tạo phần cứng, nhúng và hệ thống máy tính.', 'ACTIVE'),
     ('NH000007', 'DH000003', '7480104', 'Hệ thống thông tin', 'Đào tạo quản trị hệ thống thông tin và giải pháp doanh nghiệp.', 'ACTIVE'),
     -- NEU (DH000004)
     ('NH000008', 'DH000004', '7340101', 'Quản trị kinh doanh', 'Đào tạo quản trị doanh nghiệp, chiến lược và vận hành.', 'ACTIVE'),
     ('NH000009', 'DH000004', '7340201', 'Tài chính - Ngân hàng', 'Đào tạo nghiệp vụ tài chính, ngân hàng và đầu tư.', 'ACTIVE'),
     ('NH000010', 'DH000004', '7340122', 'Thương mại điện tử', 'Đào tạo kinh doanh số, marketing số và vận hành thương mại điện tử.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT IGNORE INTO admission_combinations (id, code, subject_1, subject_2, subject_3) VALUES
     -- Khối A
     ('TH000001', 'A00', 'Toán', 'Lý', 'Hóa'),
     ('TH000002', 'A01', 'Toán', 'Lý', 'Anh'),
     ('TH000003', 'A02', 'Toán', 'Lý', 'Sinh'),
     ('TH000004', 'A03', 'Toán', 'Lý', 'Sử'),
     ('TH000005', 'A04', 'Toán', 'Lý', 'Địa'),
     ('TH000006', 'A05', 'Toán', 'Hóa', 'Sử'),
     ('TH000007', 'A06', 'Toán', 'Hóa', 'Địa'),
     ('TH000008', 'A07', 'Toán', 'Sử', 'Địa'),
     ('TH000009', 'A08', 'Toán', 'Sử', 'GDKT&PL'),
     -- Khối B
     ('TH000010', 'B00', 'Toán', 'Hóa', 'Sinh'),
     ('TH000011', 'B01', 'Toán', 'Sinh', 'Sử'),
     ('TH000012', 'B02', 'Toán', 'Sinh', 'Địa'),
     ('TH000013', 'B03', 'Toán', 'Văn', 'Sinh'),
     -- Khối C
     ('TH000014', 'C00', 'Văn', 'Sử', 'Địa'),
     ('TH000015', 'C01', 'Toán', 'Văn', 'Lý'),
     ('TH000016', 'C02', 'Toán', 'Văn', 'Hóa'),
     ('TH000017', 'C03', 'Toán', 'Văn', 'Sử'),
     ('TH000018', 'C04', 'Toán', 'Văn', 'Địa'),
     ('TH000019', 'C05', 'Văn', 'Lý', 'Hóa'),
     ('TH000020', 'C06', 'Văn', 'Lý', 'Sinh'),
     ('TH000021', 'C07', 'Văn', 'Lý', 'Sử'),
     ('TH000022', 'C08', 'Văn', 'Hóa', 'Sinh'),
     ('TH000023', 'C09', 'Văn', 'Lý', 'Địa'),
     ('TH000024', 'C10', 'Văn', 'Hóa', 'Sử'),
     ('TH000025', 'C12', 'Văn', 'Sinh', 'Sử'),
     ('TH000026', 'C13', 'Văn', 'Sinh', 'Địa'),
     ('TH000027', 'C14', 'Toán', 'Văn', 'GDKT&PL'),
     -- Khối D
     ('TH000028', 'D01', 'Văn', 'Toán', 'Anh'),
     ('TH000029', 'D02', 'Văn', 'Toán', 'Nga'),
     ('TH000030', 'D03', 'Văn', 'Toán', 'Pháp'),
     ('TH000031', 'D04', 'Văn', 'Toán', 'Trung'),
     ('TH000032', 'D07', 'Toán', 'Hóa', 'Anh'),
     ('TH000033', 'D08', 'Toán', 'Sinh', 'Anh'),
     ('TH000034', 'D09', 'Toán', 'Sử', 'Anh'),
     ('TH000035', 'D10', 'Toán', 'Địa', 'Anh'),
     ('TH000036', 'D14', 'Văn', 'Sử', 'Anh'),
     ('TH000037', 'D15', 'Văn', 'Địa', 'Anh')`
  );

  await pool.execute(
    `INSERT IGNORE INTO major_combinations (major_id, combination_id)
     SELECT m.id, ac.id
     FROM majors m
     CROSS JOIN admission_combinations ac`
  );

  console.log("Đã chèn dữ liệu mẫu");
  console.log("  Admin: admin@example.com / admin123");
  console.log("  Thí sinh: candidate@example.com / candidate123");
  console.log("  Trường đại học/Ngành học/Tổ hợp: đã chèn");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Lỗi seed:", err);
  process.exit(1);
});
