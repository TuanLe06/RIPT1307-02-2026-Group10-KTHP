import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';

export interface AdmissionCombination {
  id: number;
  code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
  created_at: Date;
}

export interface MajorCombination {
  id: number;
  major_id: number;
  combination_id: number;
  min_score: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MajorCombinationWithDetails extends MajorCombination {
  combination_code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
}

export class AdmissionCombinationModel {
  static async create(data: {
    code: string;
    subject_1: string;
    subject_2: string;
    subject_3: string;
  }): Promise<AdmissionCombination> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO admission_combinations (code, subject_1, subject_2, subject_3)
       VALUES (?, ?, ?, ?)`,
      [data.code, data.subject_1, data.subject_2, data.subject_3]
    );

    const combination = await AdmissionCombinationModel.findById(result.insertId);
    if (!combination) throw new Error('Failed to fetch created combination');
    return combination;
  }

  static async findById(id: number): Promise<AdmissionCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, code, subject_1, subject_2, subject_3, created_at FROM admission_combinations WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as AdmissionCombination) : null;
  }

  static async findByCode(code: string): Promise<AdmissionCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, code, subject_1, subject_2, subject_3, created_at FROM admission_combinations WHERE code = ?`,
      [code]
    );
    return rows.length ? (rows[0] as AdmissionCombination) : null;
  }

  static async findAll(page = 1, limit = 10): Promise<{ combinations: AdmissionCombination[]; total: number }> {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, code, subject_1, subject_2, subject_3, created_at FROM admission_combinations
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM admission_combinations`
    );

    return {
      combinations: rows as AdmissionCombination[],
      total: Number((countRows[0] as { total: number }).total)
    };
  }
}

export class MajorCombinationModel {
  static async create(data: {
    major_id: number;
    combination_id: number;
    min_score: number;
  }): Promise<MajorCombination> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO major_combinations (major_id, combination_id, min_score, status)
       VALUES (?, ?, ?, 'ACTIVE')`,
      [data.major_id, data.combination_id, data.min_score]
    );

    const majorCombination = await MajorCombinationModel.findById(result.insertId);
    if (!majorCombination) throw new Error('Failed to fetch created major combination');
    return majorCombination;
  }

  static async findById(id: number): Promise<MajorCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, major_id, combination_id, min_score, status FROM major_combinations WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as MajorCombination) : null;
  }

  static async findByMajorId(majorId: number): Promise<MajorCombinationWithDetails[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT mc.id, mc.major_id, mc.combination_id, mc.min_score, mc.status,
              ac.code as combination_code, ac.subject_1, ac.subject_2, ac.subject_3
       FROM major_combinations mc
       LEFT JOIN admission_combinations ac ON mc.combination_id = ac.id
       WHERE mc.major_id = ? AND mc.status = 'ACTIVE'
       ORDER BY mc.created_at DESC`,
      [majorId]
    );

    return rows as MajorCombinationWithDetails[];
  }

  static async update(
    id: number,
    data: { min_score?: number; status?: string }
  ): Promise<MajorCombination | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.min_score !== undefined) {
      updates.push('min_score = ?');
      params.push(data.min_score);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) return MajorCombinationModel.findById(id);

    params.push(id);
    await pool.execute<ResultSetHeader>(
      `UPDATE major_combinations SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return MajorCombinationModel.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM major_combinations WHERE id = ?`,
      [id]
    );
    return (result.affectedRows ?? 0) > 0;
  }

  static async findByMajorIdAndCombinationId(
    majorId: number,
    combinationId: number
  ): Promise<MajorCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, major_id, combination_id, min_score, status FROM major_combinations
       WHERE major_id = ? AND combination_id = ?`,
      [majorId, combinationId]
    );
    return rows.length ? (rows[0] as MajorCombination) : null;
  }
}
