import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";
import { AdmissionCombination } from "../types/admissionCombination";
import { generateAdmissionCombinationCode } from "../utils/code.util";

const COMBINATION_FIELDS = `ac.id, ac.code, ac.subject_1, ac.subject_2, ac.subject_3, ac.created_at`;

export class AdmissionCombinationModel {
  static async create(data: {
    code: string;
    subject_1: string;
    subject_2: string;
    subject_3: string;
  }): Promise<AdmissionCombination> {
    let id = generateAdmissionCombinationCode();
    while (await AdmissionCombinationModel.findById(id)) {
      id = generateAdmissionCombinationCode();
    }
    await pool.execute<ResultSetHeader>(
      `INSERT IGNORE INTO admission_combinations (id, code, subject_1, subject_2, subject_3)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.code, data.subject_1, data.subject_2, data.subject_3],
    );
    const existing = await AdmissionCombinationModel.findByCode(data.code);
    if (!existing) throw new Error("Failed to fetch created combination");
    return existing;
  }

  static async findByCode(code: string): Promise<AdmissionCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COMBINATION_FIELDS} FROM admission_combinations ac WHERE ac.code = ?`,
      [code],
    );
    return rows.length ? (rows[0] as AdmissionCombination) : null;
  }

  static async findById(id: string): Promise<AdmissionCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COMBINATION_FIELDS} FROM admission_combinations ac WHERE ac.id = ?`,
      [id],
    );
    return rows.length ? (rows[0] as AdmissionCombination) : null;
  }

  static async findByMajorAndCode(
    majorId: string,
    code: string,
  ): Promise<AdmissionCombination | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COMBINATION_FIELDS}
       FROM admission_combinations ac
       INNER JOIN major_combinations mc ON mc.combination_id = ac.id
       WHERE mc.major_id = ? AND ac.code = ?`,
      [majorId, code],
    );
    return rows.length ? (rows[0] as AdmissionCombination) : null;
  }

  static async findAllByMajor(
    majorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ combinations: AdmissionCombination[]; total: number }> {
    const pageNum = Math.trunc(page) || 1;
    const limitNum = Math.trunc(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COMBINATION_FIELDS}
       FROM admission_combinations ac
       INNER JOIN major_combinations mc ON mc.combination_id = ac.id
       WHERE mc.major_id = ?
       LIMIT ${limitNum} OFFSET ${offset}`,
      [majorId],
    );
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM admission_combinations ac
       INNER JOIN major_combinations mc ON mc.combination_id = ac.id
       WHERE mc.major_id = ?`,
      [majorId],
    );
    return {
      combinations: rows as AdmissionCombination[],
      total: Number(countRows[0].total),
    };
  }

  static async existsByCode(
    majorId: string,
    code: string,
    excludeId?: string,
  ): Promise<boolean> {
    if (excludeId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1
         FROM admission_combinations ac
         INNER JOIN major_combinations mc ON mc.combination_id = ac.id
         WHERE mc.major_id = ? AND ac.code = ? AND ac.id != ? LIMIT 1`,
        [majorId, code, excludeId],
      );
      return rows.length > 0;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1
       FROM admission_combinations ac
       INNER JOIN major_combinations mc ON mc.combination_id = ac.id
       WHERE mc.major_id = ? AND ac.code = ? LIMIT 1`,
      [majorId, code],
    );
    return rows.length > 0;
  }

  static async update(
    id: string,
    data: Partial<Pick<AdmissionCombination, "code" | "subject_1" | "subject_2" | "subject_3">>,
  ): Promise<AdmissionCombination | null> {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );
    if (entries.length === 0) return AdmissionCombinationModel.findById(id);

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([, value]) => value);
    await pool.execute(
      `UPDATE admission_combinations SET ${fields} WHERE id = ?`,
      [...values, id],
    );
    return AdmissionCombinationModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    await pool.execute(
      `DELETE FROM major_combinations WHERE combination_id = ?`,
      [id],
    );
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM admission_combinations WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  static async linkToMajor(
    combinationId: string,
    majorId: string,
    minScore?: number,
  ): Promise<void> {
    await pool.execute(
      `INSERT IGNORE INTO major_combinations (major_id, combination_id, min_score)
       VALUES (?, ?, ?)`,
      [majorId, combinationId, minScore ?? null],
    );
  }

  static async unlinkFromMajor(
    combinationId: string,
    majorId: string,
  ): Promise<void> {
    await pool.execute(
      `DELETE FROM major_combinations WHERE major_id = ? AND combination_id = ?`,
      [majorId, combinationId],
    );
  }
}
