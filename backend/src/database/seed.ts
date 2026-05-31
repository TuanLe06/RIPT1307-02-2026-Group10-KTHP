import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
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

  const [adminResult] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'ADMIN', 'ACTIVE')`,
    ["admin@example.com", adminPassword],
  );
  const adminId = adminResult.insertId;

  const [candidateResult] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'CANDIDATE', 'ACTIVE')`,
    ["candidate@example.com", candidatePassword],
  );
  const candidateId = candidateResult.insertId;

  const [candidate2Result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'CANDIDATE', 'ACTIVE')`,
    ["nguyenvana@example.com", candidatePassword],
  );
  const candidate2Id = candidate2Result.insertId;

  const [candidate3Result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'CANDIDATE', 'ACTIVE')`,
    ["tranthib@example.com", candidatePassword],
  );
  const candidate3Id = candidate3Result.insertId;

  await pool.execute(
    `INSERT INTO universities (id, code, name, address, phone, email, website, description, status) VALUES
     ('DH000001', 'HUST', 'Đại học Bách khoa Hà Nội', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', '02438695172', 'info@hust.edu.vn', 'https://hust.edu.vn', 'Trường đại học kỹ thuật hàng đầu Việt Nam, đào tạo đa ngành về kỹ thuật và công nghệ.', 'ACTIVE'),
     ('DH000002', 'HUS', 'Trường Đại học Khoa học Tự nhiên - ĐHQG Hà Nội', '334 Nguyễn Trãi, Thanh Xuân, Hà Nội', '02438581199', 'info@hus.edu.vn', 'https://hus.edu.vn', 'Trường đại học trọng điểm đào tạo các ngành khoa học cơ bản và công nghệ.', 'ACTIVE'),
     ('DH000003', 'UET', 'Trường Đại học Công nghệ - ĐHQG Hà Nội', '144 Xuân Thủy, Cầu Giấy, Hà Nội', '02437549154', 'info@uet.vnu.edu.vn', 'https://uet.vnu.edu.vn', 'Trường đại học chuyên sâu về công nghệ thông tin và kỹ thuật hiện đại.', 'ACTIVE'),
     ('DH000004', 'NEU', 'Trường Đại học Kinh tế Quốc dân', '207 Giải Phóng, Hai Bà Trưng, Hà Nội', '02436280407', 'info@neu.edu.vn', 'https://neu.edu.vn', 'Trường đại học trọng điểm quốc gia về đào tạo kinh tế, quản lý và quản trị kinh doanh.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT INTO majors (id, university_id, code, name, description, status) VALUES
     ('NH000001', 'DH000001', '7480201', 'Công nghệ thông tin', 'Đào tạo kỹ sư công nghệ thông tin tổng quát, chuyên sâu về phần mềm và hệ thống.', 'ACTIVE'),
     ('NH000002', 'DH000001', '7520216', 'Kỹ thuật điều khiển và tự động hóa', 'Đào tạo kỹ sư về điều khiển, robot và hệ thống tự động.', 'ACTIVE'),
     ('NH000003', 'DH000001', '7520107', 'Kỹ thuật điện tử viễn thông', 'Đào tạo kỹ sư điện tử, viễn thông và xử lý tín hiệu.', 'ACTIVE'),
     ('NH000004', 'DH000002', '7480101', 'Khoa học máy tính', 'Đào tạo nền tảng thuật toán, hệ thống và trí tuệ nhân tạo.', 'ACTIVE'),
     ('NH000005', 'DH000002', '7460108', 'Khoa học dữ liệu', 'Đào tạo phân tích dữ liệu phục vụ khoa học và doanh nghiệp.', 'ACTIVE'),
     ('NH000006', 'DH000003', '7480106', 'Kỹ thuật máy tính', 'Đào tạo phần cứng, nhúng và hệ thống máy tính.', 'ACTIVE'),
     ('NH000007', 'DH000003', '7480104', 'Hệ thống thông tin', 'Đào tạo quản trị hệ thống thông tin và giải pháp doanh nghiệp.', 'ACTIVE'),
     ('NH000008', 'DH000004', '7340101', 'Quản trị kinh doanh', 'Đào tạo quản trị doanh nghiệp, chiến lược và vận hành.', 'ACTIVE'),
     ('NH000009', 'DH000004', '7340201', 'Tài chính - Ngân hàng', 'Đào tạo nghiệp vụ tài chính, ngân hàng và đầu tư.', 'ACTIVE'),
     ('NH000010', 'DH000004', '7340122', 'Thương mại điện tử', 'Đào tạo kinh doanh số, marketing số và vận hành thương mại điện tử.', 'ACTIVE')`,
  );

  await pool.execute(
    `INSERT INTO admission_combinations (id, code, subject_1, subject_2, subject_3) VALUES
     ('TH000001', 'A00', 'Toán', 'Lý', 'Hóa'),
     ('TH000002', 'A01', 'Toán', 'Lý', 'Anh'),
     ('TH000003', 'A02', 'Toán', 'Lý', 'Sinh'),
     ('TH000004', 'A03', 'Toán', 'Lý', 'Sử'),
     ('TH000005', 'A04', 'Toán', 'Lý', 'Địa'),
     ('TH000006', 'A05', 'Toán', 'Hóa', 'Sử'),
     ('TH000007', 'A06', 'Toán', 'Hóa', 'Địa'),
     ('TH000008', 'A07', 'Toán', 'Sử', 'Địa'),
     ('TH000009', 'A08', 'Toán', 'Sử', 'GDKT&PL'),
     ('TH000010', 'B00', 'Toán', 'Hóa', 'Sinh'),
     ('TH000011', 'B01', 'Toán', 'Sinh', 'Sử'),
     ('TH000012', 'B02', 'Toán', 'Sinh', 'Địa'),
     ('TH000013', 'B03', 'Toán', 'Văn', 'Sinh'),
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
    `INSERT INTO major_combinations (major_id, combination_id)
     SELECT m.id, ac.id
     FROM majors m
     CROSS JOIN admission_combinations ac`
  );

  // Candidate profiles
  const profiles = [
    { userId: candidateId, citizenId: 123456789, fullName: "Nguyễn Văn An", phone: "0912345678", dob: "2002-05-15", gender: "MALE", province: "Hà Nội" },
    { userId: candidate2Id, citizenId: 987654321, fullName: "Trần Thị Hồng", phone: "0987654321", dob: "2003-08-22", gender: "FEMALE", province: "Hải Phòng" },
    { userId: candidate3Id, citizenId: 456789123, fullName: "Lê Minh Tâm", phone: "0977112233", dob: "2002-11-03", gender: "MALE", province: "Đà Nẵng" },
  ];
  for (const p of profiles) {
    await pool.execute(
      `INSERT INTO candidate_profiles (citizen_id, user_id, full_name, phone, date_of_birth, gender, province, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.citizenId, p.userId, p.fullName, p.phone, p.dob, p.gender, p.province, `${p.province}, Việt Nam`],
    );
  }

  // Academic records & exam scores
  const academicData = [
    { userId: candidateId, graduationYear: 2024, priorityScore: 0.25, scores: [
      { subjectCode: 'TOAN', score: 8.5, isRequired: true },
      { subjectCode: 'VAN', score: 7.0, isRequired: true },
      { subjectCode: 'LY', score: 7.5, isRequired: false },
      { subjectCode: 'HOA', score: 8.0, isRequired: false },
    ]},
    { userId: candidate2Id, graduationYear: 2024, priorityScore: 0, scores: [
      { subjectCode: 'TOAN', score: 9.0, isRequired: true },
      { subjectCode: 'VAN', score: 8.0, isRequired: true },
      { subjectCode: 'NGOAINGU', score: 9.5, isRequired: false },
      { subjectCode: 'LY', score: 8.5, isRequired: false },
    ], foreignLanguage: { languageCode: 'ANH', languageName: 'Tiếng Anh' }},
    { userId: candidate3Id, graduationYear: 2024, priorityScore: 0.5, scores: [
      { subjectCode: 'TOAN', score: 7.0, isRequired: true },
      { subjectCode: 'VAN', score: 6.5, isRequired: true },
      { subjectCode: 'SINH', score: 8.0, isRequired: false },
      { subjectCode: 'HOA', score: 7.5, isRequired: false },
    ]},
  ];

  for (const a of academicData) {
    const [cpRow] = await pool.execute<RowDataPacket[]>(
      `SELECT citizen_id FROM candidate_profiles WHERE user_id = ? LIMIT 1`,
      [a.userId],
    );
    if (!cpRow.length) continue;
    const citizenId = cpRow[0].citizen_id;

    const [arResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO academic_records (candidate_id, graduation_year, priority_score) VALUES (?, ?, ?)`,
      [citizenId, a.graduationYear, a.priorityScore],
    );
    const recordId = arResult.insertId;

    for (const s of a.scores) {
      await pool.execute(
        `INSERT INTO exam_scores (record_id, subject_code, is_required, score) VALUES (?, ?, ?, ?)`,
        [recordId, s.subjectCode, s.isRequired, s.score],
      );
    }

    if (a.foreignLanguage) {
      await pool.execute(
        `INSERT INTO foreign_language_scores (record_id, language_code, language_name) VALUES (?, ?, ?)`,
        [recordId, a.foreignLanguage.languageCode, a.foreignLanguage.languageName],
      );
    }
  }

  // Applications with various statuses
  const appData = [
    { candidateId: candidateId, code: "HS-2024-001", uniId: "DH000001", majorId: "NH000001", combId: "TH000002", status: "PASSED", submittedAt: "2024-05-24 08:30:00", reviewedBy: adminId },
    { candidateId: candidateId, code: "HS-2024-002", uniId: "DH000003", majorId: "NH000006", combId: "TH000001", status: "PENDING_REVIEW", submittedAt: "2024-05-23 10:15:00", reviewedBy: null },
    { candidateId: candidate2Id, code: "HS-2024-003", uniId: "DH000004", majorId: "NH000008", combId: "TH000028", status: "REJECTED", submittedAt: "2024-05-22 14:00:00", reviewedBy: adminId },
    { candidateId: candidate2Id, code: "HS-2024-004", uniId: "DH000002", majorId: "NH000004", combId: "TH000002", status: "APPROVED", submittedAt: "2024-05-21 09:45:00", reviewedBy: adminId },
    { candidateId: candidate3Id, code: "HS-2024-005", uniId: "DH000001", majorId: "NH000002", combId: "TH000001", status: "SUBMITTED", submittedAt: "2024-06-01 07:30:00", reviewedBy: null },
    { candidateId: candidate3Id, code: "HS-2024-006", uniId: "DH000003", majorId: "NH000007", combId: "TH000032", status: "DRAFT", submittedAt: null, reviewedBy: null },
    { candidateId: candidateId, code: "HS-2024-007", uniId: "DH000004", majorId: "NH000009", combId: "TH000028", status: "PASSED", submittedAt: "2024-05-20 11:00:00", reviewedBy: adminId },
    { candidateId: candidate2Id, code: "HS-2024-008", uniId: "DH000001", majorId: "NH000003", combId: "TH000002", status: "FAILED", submittedAt: "2024-05-19 16:30:00", reviewedBy: adminId },
    { candidateId: candidate3Id, code: "HS-2024-009", uniId: "DH000002", majorId: "NH000005", combId: "TH000032", status: "PENDING_REVIEW", submittedAt: "2024-06-02 13:00:00", reviewedBy: null },
    { candidateId: candidateId, code: "HS-2024-010", uniId: "DH000002", majorId: "NH000004", combId: "TH000002", status: "PENDING_REVIEW", submittedAt: "2024-06-03 08:00:00", reviewedBy: null },
  ];
  for (const a of appData) {
    if (a.submittedAt) {
      await pool.execute(
        `INSERT INTO applications (candidate_id, application_code, university_id, major_id, combination_id, status, submitted_at, reviewed_by, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [a.candidateId, a.code, a.uniId, a.majorId, a.combId, a.status, a.submittedAt, a.reviewedBy],
      );
    } else {
      await pool.execute(
        `INSERT INTO applications (candidate_id, application_code, university_id, major_id, combination_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [a.candidateId, a.code, a.uniId, a.majorId, a.combId, a.status],
      );
    }
  }

  // Application status logs
  const logs = [
    { code: "HS-2024-001", oldStatus: "DRAFT", newStatus: "SUBMITTED" },
    { code: "HS-2024-001", oldStatus: "SUBMITTED", newStatus: "PENDING_REVIEW" },
    { code: "HS-2024-001", oldStatus: "PENDING_REVIEW", newStatus: "APPROVED" },
    { code: "HS-2024-001", oldStatus: "APPROVED", newStatus: "PASSED" },
    { code: "HS-2024-003", oldStatus: "DRAFT", newStatus: "SUBMITTED" },
    { code: "HS-2024-003", oldStatus: "SUBMITTED", newStatus: "PENDING_REVIEW" },
    { code: "HS-2024-003", oldStatus: "PENDING_REVIEW", newStatus: "REJECTED" },
    { code: "HS-2024-004", oldStatus: "DRAFT", newStatus: "SUBMITTED" },
    { code: "HS-2024-004", oldStatus: "SUBMITTED", newStatus: "PENDING_REVIEW" },
    { code: "HS-2024-004", oldStatus: "PENDING_REVIEW", newStatus: "APPROVED" },
    { code: "HS-2024-008", oldStatus: "DRAFT", newStatus: "SUBMITTED" },
    { code: "HS-2024-008", oldStatus: "SUBMITTED", newStatus: "REJECTED" },
    { code: "HS-2024-008", oldStatus: "REJECTED", newStatus: "FAILED" },
    { code: "HS-2024-007", oldStatus: "DRAFT", newStatus: "SUBMITTED" },
    { code: "HS-2024-007", oldStatus: "SUBMITTED", newStatus: "PENDING_REVIEW" },
    { code: "HS-2024-007", oldStatus: "PENDING_REVIEW", newStatus: "APPROVED" },
    { code: "HS-2024-007", oldStatus: "APPROVED", newStatus: "PASSED" },
  ];
  for (const log of logs) {
    const [appRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM applications WHERE application_code = ?`,
      [log.code],
    );
    if (appRows.length > 0) {
      await pool.execute(
        `INSERT INTO application_status_logs (application_id, old_status, new_status, changed_by, note, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
        [appRows[0].id, log.oldStatus, log.newStatus, adminId, `Seed: ${log.oldStatus} -> ${log.newStatus}`],
      );
    }
  }

  console.log("Đã chèn dữ liệu mẫu");
  console.log(`  Admin: admin@example.com / admin123 (ID: ${adminId})`);
  console.log(`  Thí sinh: candidate@example.com / candidate123 (ID: ${candidateId})`);
  console.log(`  Thí sinh 2: nguyenvana@example.com / candidate123 (ID: ${candidate2Id})`);
  console.log(`  Thí sinh 3: tranthib@example.com / candidate123 (ID: ${candidate3Id})`);
  console.log("  Trường đại học/Ngành học/Tổ hợp: đã chèn");
  console.log("  Hồ sơ ứng tuyển: 10 hồ sơ mẫu");
  console.log("  Lịch sử trạng thái: đã chèn");
  console.log("  Học bạ + Điểm thi: 3 thí sinh mẫu");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Lỗi seed:", err);
  process.exit(1);
});
