import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';

interface CompletenessResult {
  isComplete: boolean;
  missingFields: string[];
}

const checkCompleteness = async (userId: number): Promise<CompletenessResult> => {
  const missingFields: string[] = [];

  const [profileRows] = await pool.execute<RowDataPacket[]>(
    `SELECT phone, date_of_birth, gender, province, address
     FROM candidate_profiles WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  if (!profileRows.length) {
    return { isComplete: false, missingFields: ['Hồ sơ cá nhân chưa được tạo'] };
  }

  const p = profileRows[0];
  if (!p.phone) missingFields.push('Số điện thoại');
  if (!p.date_of_birth) missingFields.push('Ngày sinh');
  if (!p.gender) missingFields.push('Giới tính');
  if (!p.province) missingFields.push('Tỉnh/Thành phố');
  if (!p.address) missingFields.push('Địa chỉ');

  const [recordRows] = await pool.execute<RowDataPacket[]>(
    `SELECT ar.id, ar.graduation_year
     FROM academic_records ar
     JOIN candidate_profiles cp ON cp.citizen_id = ar.candidate_id
     WHERE cp.user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (!recordRows.length) {
    missingFields.push('Thông tin học tập (chưa có bảng điểm)');
  } else {
    const r = recordRows[0];
    if (!r.graduation_year) missingFields.push('Năm tốt nghiệp');

    const [scoreRows] = await pool.execute<RowDataPacket[]>(
      `SELECT subject_code
       FROM exam_scores
       WHERE record_id = ?`,
      [r.id]
    );
    const subjectCodes = scoreRows.map((row) => String(row.subject_code));
    if (subjectCodes.length !== 4) {
      missingFields.push('Điểm thi phải đủ đúng 4 môn');
    } else {
      if (!subjectCodes.includes('TOAN') || !subjectCodes.includes('VAN')) {
        missingFields.push('Điểm thi bắt buộc có TOÁN và VĂN');
      }

      const optionalCodes = subjectCodes.filter((code) => code !== 'TOAN' && code !== 'VAN');
      const allowedOptionalCodes = ['LY', 'HOA', 'SINH', 'SU', 'DIA', 'GDKTPL', 'TINHOC', 'CONGNGHE', 'NGOAINGU'];
      if (optionalCodes.length !== 2 || optionalCodes.some((code) => !allowedOptionalCodes.includes(code))) {
        missingFields.push('2 môn tự chọn chưa hợp lệ');
      }

      const [foreignLanguageRows] = await pool.execute<RowDataPacket[]>(
        `SELECT language_code
         FROM foreign_language_scores
         WHERE record_id = ?
         LIMIT 1`,
        [r.id]
      );
      const hasForeignLanguageSubject = subjectCodes.includes('NGOAINGU');
      if (hasForeignLanguageSubject && !foreignLanguageRows.length) {
        missingFields.push('Thiếu thông tin ngoại ngữ cho môn NGOAINGU');
      }
      if (!hasForeignLanguageSubject && foreignLanguageRows.length) {
        missingFields.push('Dữ liệu ngoại ngữ không khớp môn đã chọn');
      }
    }

    const [progressRows] = await pool.execute<RowDataPacket[]>(
      `SELECT school_name FROM academic_progress WHERE record_id = ? AND grade_level = 12 LIMIT 1`,
      [r.id]
    );

    if (!progressRows.length || !progressRows[0].school_name) {
      missingFields.push('Trường THPT (lớp 12)');
    }

    const [certificateRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id
       FROM candidate_documents cd
       JOIN candidate_profiles cp ON cp.citizen_id = cd.candidate_id
       WHERE cp.user_id = ?
         AND cd.document_type = 'EXAM_CERTIFICATE'
         AND cd.deleted_at IS NULL
       LIMIT 1`,
      [userId]
    );

    if (!certificateRows.length) {
      missingFields.push('Giấy chứng nhận kết quả thi');
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
};

export const requireCompleteProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await checkCompleteness(req.user!.id);
    if (!result.isComplete) {
      res.status(400).json({
        success: false,
        message: 'Bạn chưa hoàn thành thông tin cá nhân / thông tin học tập',
        missing_fields: result.missingFields,
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProfileCompletenessHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await checkCompleteness(req.user!.id);
    res.json({
      success: true,
      data: {
        is_complete: result.isComplete,
        missing_fields: result.missingFields,
        message: result.isComplete
          ? 'Hồ sơ đã hoàn thành, bạn có thể đăng ký xét tuyển'
          : `Còn thiếu: ${result.missingFields.join(', ')}`,
      },
    });
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
