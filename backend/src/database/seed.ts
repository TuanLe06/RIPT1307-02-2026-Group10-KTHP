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
     ('VNUHCM-US', 'Truong Dai hoc Khoa hoc Tu nhien - DHQG TP.HCM', '227 Nguyen Van Cu, Quan 5, TP.HCM', '02838354466', 'info@hcmus.edu.vn', 'https://hcmus.edu.vn', 'Truong dai hoc dao tao khoi nganh khoa hoc co ban va cong nghe.', 'ACTIVE'),
     ('VNUHCM-UIT', 'Truong Dai hoc Cong nghe Thong tin - DHQG TP.HCM', 'Khu pho 6, P. Linh Trung, TP. Thu Duc, TP.HCM', '02837252002', 'info@uit.edu.vn', 'https://uit.edu.vn', 'Truong dai hoc chuyen sau ve cong nghe thong tin va truyen thong.', 'ACTIVE'),
     ('HCMUT', 'Truong Dai hoc Bach khoa - DHQG TP.HCM', '268 Ly Thuong Kiet, Quan 10, TP.HCM', '02838654087', 'info@hcmut.edu.vn', 'https://hcmut.edu.vn', 'Truong ky thuat trong diem voi nhieu nganh cong nghe va ky thuat.', 'ACTIVE'),
     ('UEH', 'Truong Dai hoc Kinh te TP.HCM', '59C Nguyen Dinh Chieu, Quan 3, TP.HCM', '02838295299', 'contact@ueh.edu.vn', 'https://ueh.edu.vn', 'Truong dai hoc trong diem ve kinh te, quan tri va kinh doanh.', 'ACTIVE')`
  );

  await pool.execute(
    `INSERT IGNORE INTO majors (university_id, code, name, description, status)
     SELECT u.id, m.code, m.name, m.description, 'ACTIVE'
     FROM (
       SELECT 'VNUHCM-UIT' AS university_code, '7480201' AS code, 'Cong nghe thong tin' AS name, 'Dao tao ky su CNTT tong quat.' AS description
       UNION ALL SELECT 'VNUHCM-UIT', '7480108', 'Khoa hoc du lieu', 'Dao tao chuyen sau phan tich du lieu, AI va hoc may.'
       UNION ALL SELECT 'VNUHCM-UIT', '7480102', 'Mang may tinh va truyen thong du lieu', 'Dao tao ve ha tang mang, bao mat va truyen thong.'
       UNION ALL SELECT 'VNUHCM-US', '7480101', 'Khoa hoc may tinh', 'Dao tao nen tang thuat toan, he thong va tri tue nhan tao.'
       UNION ALL SELECT 'VNUHCM-US', '7460108', 'Khoa hoc du lieu', 'Dao tao phan tich du lieu phuc vu khoa hoc va doanh nghiep.'
       UNION ALL SELECT 'HCMUT', '7520216', 'Ky thuat dieu khien va tu dong hoa', 'Dao tao ky su dieu khien, robot va he thong tu dong.'
       UNION ALL SELECT 'HCMUT', '7480106', 'Ky thuat may tinh', 'Dao tao phan cung, nhung va he thong may tinh.'
       UNION ALL SELECT 'UEH', '7340101', 'Quan tri kinh doanh', 'Dao tao quan tri doanh nghiep, chien luoc va van hanh.'
       UNION ALL SELECT 'UEH', '7340201', 'Tai chinh - Ngan hang', 'Dao tao nghiep vu tai chinh, ngan hang va dau tu.'
       UNION ALL SELECT 'UEH', '7340122', 'Thuong mai dien tu', 'Dao tao kinh doanh so, marketing so va van hanh TMDT.'
     ) m
     INNER JOIN universities u ON u.code = m.university_code`
  );

  await pool.execute(
    `INSERT IGNORE INTO admission_combinations (code, subject_1, subject_2, subject_3) VALUES
     ('A00', 'Toan', 'Vat ly', 'Hoa hoc'),
     ('A01', 'Toan', 'Vat ly', 'Tieng Anh'),
     ('D01', 'Toan', 'Ngu van', 'Tieng Anh'),
     ('D07', 'Toan', 'Hoa hoc', 'Tieng Anh'),
     ('B00', 'Toan', 'Hoa hoc', 'Sinh hoc'),
     ('C00', 'Ngu van', 'Lich su', 'Dia ly')`
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
