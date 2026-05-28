import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

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
    `SELECT ar.id, ar.graduation_year, ar.science_group
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
    if (!r.science_group) missingFields.push('Khối học (KHTN/KHXH)');

    const [progressRows] = await pool.execute<RowDataPacket[]>(
      `SELECT school_name FROM academic_progress WHERE record_id = ? AND grade_level = 12 LIMIT 1`,
      [r.id]
    );

    if (!progressRows.length || !progressRows[0].school_name) {
      missingFields.push('Trường THPT (lớp 12)');
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
