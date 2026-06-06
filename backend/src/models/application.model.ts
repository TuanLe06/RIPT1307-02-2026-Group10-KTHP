import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { getDeadlineConfig } from '../utils/deadline.util';

export interface Application {
  id: number;
  candidate_id: number;
  application_code: string;
  university_id: string;
  major_id: string;
  combination_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PASSED' | 'FAILED';
  submitted_at: Date | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  reject_reason: string | null;
  subject_1_score: number | null;
  subject_2_score: number | null;
  subject_3_score: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationWithDetails extends Application {
  university_name: string;
  university_code: string;
  major_name: string;
  major_code: string;
  candidate_name: string;
  candidate_email: string;
  reviewer_name?: string;
}

export class ApplicationModel {
  static async create(data: {
    candidate_id: number;
    university_id: number;
    major_id: number;
    combination_id: number;
    subject_1_score?: number | null;
    subject_2_score?: number | null;
    subject_3_score?: number | null;
  }): Promise<Application> {
    const application_code = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO applications (candidate_id, application_code, university_id, major_id, combination_id, status, subject_1_score, subject_2_score, subject_3_score)
       VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?)`,
      [data.candidate_id, application_code, data.university_id, data.major_id, data.combination_id,
       data.subject_1_score ?? null, data.subject_2_score ?? null, data.subject_3_score ?? null]
    );

    const application = await ApplicationModel.findById(result.insertId);
    if (!application) throw new Error('Failed to fetch created application');
    return application;
  }

  static async findById(id: number): Promise<Application | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, application_code, university_id, major_id, combination_id, status,
              submitted_at, reviewed_by, reviewed_at, reject_reason,
              subject_1_score, subject_2_score, subject_3_score, created_at, updated_at
       FROM applications WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as Application) : null;
  }

  static async findByIdWithDetails(id: number): Promise<ApplicationWithDetails | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.id, a.candidate_id, a.application_code, a.university_id, a.major_id, a.combination_id,
              a.status, a.submitted_at, a.reviewed_by, a.reviewed_at, a.reject_reason,
              a.subject_1_score, a.subject_2_score, a.subject_3_score,
              a.created_at, a.updated_at, u.name as university_name, u.code as university_code,
              m.name as major_name, m.code as major_code, cp.full_name as candidate_name,
              u2.email as candidate_email, reviewer.email as reviewer_name
       FROM applications a
       LEFT JOIN universities u ON a.university_id = u.id
       LEFT JOIN majors m ON a.major_id = m.id
       LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
       LEFT JOIN users u2 ON cp.user_id = u2.id
       LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
       WHERE a.id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as ApplicationWithDetails) : null;
  }

  static async findByApplicationCode(code: string): Promise<Application | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, application_code, university_id, major_id, combination_id, status,
              submitted_at, reviewed_by, reviewed_at, reject_reason,
              subject_1_score, subject_2_score, subject_3_score, created_at, updated_at
       FROM applications WHERE application_code = ?`,
      [code]
    );
    return rows.length ? (rows[0] as Application) : null;
  }

  static async findByCandidateId(
    candidateId: number,
    page = 1,
    limit = 10
  ): Promise<{ applications: ApplicationWithDetails[]; total: number }> {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.id, a.candidate_id, a.application_code, a.university_id, a.major_id, a.combination_id,
              a.status, a.submitted_at, a.reviewed_by, a.reviewed_at, a.reject_reason,
              a.subject_1_score, a.subject_2_score, a.subject_3_score,
              a.created_at, a.updated_at, u.name as university_name, u.code as university_code,
              m.name as major_name, m.code as major_code, cp.full_name as candidate_name,
              u2.email as candidate_email, reviewer.email as reviewer_name
        FROM applications a
        LEFT JOIN universities u ON a.university_id = u.id
        LEFT JOIN majors m ON a.major_id = m.id
        LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
        LEFT JOIN users u2 ON cp.user_id = u2.id
        LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
        WHERE a.candidate_id = ?
        ORDER BY a.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      [candidateId]
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM applications WHERE candidate_id = ?`,
      [candidateId]
    );

    return {
      applications: rows as ApplicationWithDetails[],
      total: Number((countRows[0] as { total: number }).total)
    };
  }

  static async findAllByAdmin(
    page = 1,
    limit = 10,
    filters?: { university_id?: string; major_id?: string; status?: string; search?: string }
  ): Promise<{ applications: ApplicationWithDetails[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params: any[] = [];

    if (filters?.university_id) {
      whereClause += ' AND a.university_id = ?';
      params.push(filters.university_id);
    }
    if (filters?.major_id) {
      whereClause += ' AND a.major_id = ?';
      params.push(filters.major_id);
    }
    if (filters?.status) {
      whereClause += ' AND a.status = ?';
      params.push(filters.status);
    }
    if (filters?.search) {
      whereClause += ' AND (cp.full_name LIKE ? OR a.application_code LIKE ? OR u2.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.id, a.candidate_id, a.application_code, a.university_id, a.major_id, a.combination_id,
              a.status, a.submitted_at, a.reviewed_by, a.reviewed_at, a.reject_reason,
              a.subject_1_score, a.subject_2_score, a.subject_3_score,
              a.created_at, a.updated_at, u.name as university_name, u.code as university_code,
              m.name as major_name, m.code as major_code, cp.full_name as candidate_name,
              u2.email as candidate_email, reviewer.email as reviewer_name
        FROM applications a
        LEFT JOIN universities u ON a.university_id = u.id
        LEFT JOIN majors m ON a.major_id = m.id
        LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
        LEFT JOIN users u2 ON cp.user_id = u2.id
        LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
        WHERE ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM applications a
        LEFT JOIN universities u ON a.university_id = u.id
        LEFT JOIN majors m ON a.major_id = m.id
        LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
        LEFT JOIN users u2 ON cp.user_id = u2.id
        WHERE ${whereClause}`,
      params
    );

    return {
      applications: rows as ApplicationWithDetails[],
      total: Number((countRows[0] as { total: number }).total)
    };
  }

  static async submit(id: number): Promise<Application | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE applications SET status = 'SUBMITTED', submitted_at = NOW() WHERE id = ?`,
      [id]
    );
    return ApplicationModel.findById(id);
  }

  static async updateStatus(
    id: number,
    status: string,
    reviewedBy?: number,
    rejectReason?: string
  ): Promise<Application | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE applications 
       SET status = ?, reviewed_by = COALESCE(?, reviewed_by), 
           reviewed_at = NOW(), reject_reason = COALESCE(?, reject_reason)
       WHERE id = ?`,
      [status, reviewedBy || null, rejectReason || null, id]
    );
    return ApplicationModel.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM applications WHERE id = ?`,
      [id]
    );
    return (result.affectedRows ?? 0) > 0;
  }

  static async getStatistics(universityId?: number, majorId?: number) {
    let whereClause = '1=1';
    const params: any[] = [];

    if (universityId) {
      whereClause += ' AND a.university_id = ?';
      params.push(universityId);
    }
    if (majorId) {
      whereClause += ' AND a.major_id = ?';
      params.push(majorId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM applications a
       WHERE ${whereClause}`,
      params
    );

    return rows[0];
  }

  static async hasSubmittedInCurrentPeriod(candidateId: number): Promise<boolean> {
    const { startDate, endDate } = getDeadlineConfig();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM applications 
       WHERE candidate_id = ? 
       AND submitted_at IS NOT NULL
       AND submitted_at >= ?
       AND submitted_at <= ?`,
      [candidateId, startDate, endDate]
    );
    return Number((rows[0] as { count: number }).count) > 0;
  }
}
