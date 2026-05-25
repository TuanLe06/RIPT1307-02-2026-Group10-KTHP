import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";
import { Major, University } from "../types/university";
import { generateUniversityCode, generateMajorCode } from "../utils/code.util";

const UNIVERSITY_FIELDS = `
  id, code, name, address, phone, email, website, description,
  status, created_at, updated_at
`;

const MAJOR_FIELDS = `
  id, university_id, code, name,
  description, min_score, status, created_at, updated_at
`;

export class UniversityModel {
  static async create(data: {
    code: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    description?: string | null;
  }): Promise<University> {
    let id = generateUniversityCode();
    while (await UniversityModel.findById(id)) {
      id = generateUniversityCode();
    }
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO universities (id, code, name, address, phone, email, website, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.code,
        data.name,
        data.address ?? null,
        data.phone ?? null,
        data.email ?? null,
        data.website ?? null,
        data.description ?? null,
      ],
    );
    const university = await UniversityModel.findById(id);
    if (!university) throw new Error("Failed to fetch created university");
    return university;
  }

  static async findByCode(code: string): Promise<University | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${UNIVERSITY_FIELDS} FROM universities WHERE code = ? AND status = 'ACTIVE'`,
      [code],
    );
    return rows.length ? (rows[0] as University) : null;
  }

  static async findIdByCode(code: string): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM universities WHERE code = ? AND status = 'ACTIVE'",
      [code],
    );
    return rows.length ? (rows[0] as { id: string }).id : null;
  }

  static async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ universities: University[]; total: number }> {
    const pageNum = Math.trunc(page) || 1;
    const limitNum = Math.trunc(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${UNIVERSITY_FIELDS} FROM universities WHERE status = 'ACTIVE' LIMIT ${limitNum} OFFSET ${offset}`,
    );
    const [countRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM universities WHERE status = 'ACTIVE'",
    );
    return {
      universities: rows as University[],
      total: Number(countRows[0].total),
    };
  }

  static async findById(id: string): Promise<University | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${UNIVERSITY_FIELDS} FROM universities WHERE id = ?`,
      [id],
    );
    return rows.length ? (rows[0] as University) : null;
  }

  static async existsByCode(
    code: string,
    excludeId?: string,
  ): Promise<boolean> {
    if (excludeId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM universities WHERE code = ? AND id != ? AND status = 'ACTIVE' LIMIT 1`,
        [code, excludeId],
      );
      return rows.length > 0;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM universities WHERE code = ? AND status = 'ACTIVE' LIMIT 1`,
      [code],
    );
    return rows.length > 0;
  }

  static async update(
    id: string,
    data: Partial<
      Pick<
        University,
        | "code"
        | "name"
        | "address"
        | "phone"
        | "email"
        | "website"
        | "description"
        | "status"
      >
    >,
  ): Promise<University | null> {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );
    if (entries.length === 0) return UniversityModel.findById(id);

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([, value]) => value);
    await pool.execute(
      `UPDATE universities SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id],
    );
    return UniversityModel.findById(id);
  }

  static async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE universities SET status = 'INACTIVE', updated_at = NOW() WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  static async hasRelatedApplications(universityId: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM applications WHERE university_id = ? LIMIT 1`,
      [universityId],
    );
    return rows.length > 0;
  }
}

export class MajorModel {
  static async create(data: {
    university_id: string;
    code: string;
    name: string;
    description?: string | null;
    min_score?: number | null;
  }): Promise<Major> {
    let id = generateMajorCode();
    while (await MajorModel.findById(id)) {
      id = generateMajorCode();
    }
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO majors (id, university_id, code, name, description, min_score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.university_id,
        data.code,
        data.name,
        data.description ?? null,
        data.min_score ?? null,
      ],
    );
    const major = await MajorModel.findById(id);
    if (!major) throw new Error("Failed to fetch created major");
    return major;
  }

  static async findByCode(
    universityId: string,
    code: string,
  ): Promise<Major | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${MAJOR_FIELDS} FROM majors WHERE university_id = ? AND code = ? AND status = 'ACTIVE'`,
      [universityId, code],
    );
    return rows.length ? (rows[0] as Major) : null;
  }

  static async findAllByUniversity(
    universityId: string,
    page = 1,
    limit = 10,
  ): Promise<{ majors: Major[]; total: number }> {
    const pageNum = Math.trunc(page) || 1;
    const limitNum = Math.trunc(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${MAJOR_FIELDS} FROM majors WHERE university_id = ? AND status = 'ACTIVE' LIMIT ${limitNum} OFFSET ${offset}`,
      [universityId],
    );
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM majors WHERE university_id = ? AND status = 'ACTIVE'`,
      [universityId],
    );
    return { majors: rows as Major[], total: Number(countRows[0].total) };
  }

  static async findById(id: string): Promise<Major | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${MAJOR_FIELDS} FROM majors WHERE id = ?`,
      [id],
    );
    return rows.length ? (rows[0] as Major) : null;
  }

  static async existsByCode(
    universityId: string,
    code: string,
    excludeId?: string,
  ): Promise<boolean> {
    if (excludeId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 1 FROM majors WHERE university_id = ? AND code = ? AND id != ? AND status = 'ACTIVE' LIMIT 1`,
        [universityId, code, excludeId],
      );
      return rows.length > 0;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM majors WHERE university_id = ? AND code = ? AND status = 'ACTIVE' LIMIT 1`,
      [universityId, code],
    );
    return rows.length > 0;
  }

  static async update(
    id: string,
    data: Partial<
      Pick<
        Major,
        | "code"
        | "name"
        | "description"
        | "min_score"
        | "status"
      >
    >,
  ): Promise<Major | null> {
    const entries = Object.entries(data).filter(
      ([, value]) => value !== undefined,
    );
    if (entries.length === 0) return MajorModel.findById(id);

    const fields = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([, value]) => value);
    await pool.execute(
      `UPDATE majors SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id],
    );
    return MajorModel.findById(id);
  }

  static async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE majors SET status = 'INACTIVE', updated_at = NOW() WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  static async hasRelatedApplications(majorId: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM applications WHERE major_id = ? LIMIT 1`,
      [majorId],
    );
    return rows.length > 0;
  }

  static async universityExists(universityId: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM universities WHERE id = ? AND status = 'ACTIVE' LIMIT 1`,
      [universityId],
    );
    return rows.length > 0;
  }

}
