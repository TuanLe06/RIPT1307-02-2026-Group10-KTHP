import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { CandidateProfile } from '../types';

type UserAuthSlice = {
  user_id: number;
  email: string;
  role: 'CANDIDATE' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  last_login_at: Date | null;
};

type CandidateProfileCore = Omit<CandidateProfile, 'created_at' | 'updated_at'>;
type CandidateProfileJoined = UserAuthSlice & CandidateProfileCore;
type AcademicRecordRow = {
  id: number;
  candidate_id: number;
  graduation_year: number | null;
  priority_score: string;
};
type AcademicSubjectScoreRow = {
  subject_code: string;
  is_required: number;
  score: string;
};
type ForeignLanguageScoreRow = {
  language_code: 'ANH' | 'PHAP' | 'DUC' | 'NHAT' | 'HAN' | 'NGA' | 'TRUNG';
  language_name: string;
};
type AcademicProgressRow = {
  grade_level: number | null;
  school_name: string | null;
  avg_score: string | null;
};
type CandidateDocumentType =
  | 'TRANSCRIPT'
  | 'CITIZEN_ID_Front'
  | 'CITIZEN_ID_Back'
  | 'PORTRAIT'
  | 'CERTIFICATE'
  | 'EXAM_CERTIFICATE'
  | 'OTHER';
type CandidateDocumentRow = {
  id: number;
  candidate_id: number;
  document_type: CandidateDocumentType;
  file_name: string;
  file_url: string;
  file_type: 'PDF' | 'JPEG' | 'PNG';
  file_size: number | null;
  uploaded_at: Date;
  deleted_at: Date | null;
};

export type CandidateDocumentItem = {
  id: number;
  document_type: CandidateDocumentType;
  file_name: string;
  file_url: string;
  file_type: 'PDF' | 'JPEG' | 'PNG';
  file_size: number | null;
  uploaded_at: Date;
};

export type CandidateAcademicProgressPayload = {
  school_name?: string | null;
  avg_score?: number | null;
};

export type CandidateAcademicRecordFull = {
  academic_record: {
    id: number | null;
    candidate_id: number;
    graduation_year: number | null;
    priority_score: number;
    exam_scores: Array<{ subject_code: string; subject_name: string; is_required: boolean; score: number }>;
    foreign_language: ForeignLanguageScoreRow | null;
  } | null;
  academic_progress: {
    grade_10: CandidateAcademicProgressPayload;
    grade_11: CandidateAcademicProgressPayload;
    grade_12: CandidateAcademicProgressPayload;
  };
};

export type CandidateExamScoresPayload = {
  scores: Record<string, number>;
  foreign_language?: {
    language_code: 'ANH' | 'PHAP' | 'DUC' | 'NHAT' | 'HAN' | 'NGA' | 'TRUNG';
  };
};

export type CandidateProfileFull = {
  user: {
    id: number;
    email: string;
    role: 'CANDIDATE' | 'ADMIN';
    status: 'ACTIVE' | 'LOCKED' | 'PENDING';
    last_login_at: Date | null;
  };
  candidate_profile: Omit<CandidateProfileCore, 'user_id'>;
};

export class CandidateProfileModel {
  private static readonly REQUIRED_SUBJECT_CODES = ['TOAN', 'VAN'] as const;
  private static readonly OPTIONAL_SUBJECT_CODES = [
    'LY',
    'HOA',
    'SINH',
    'SU',
    'DIA',
    'GDKTPL',
    'TINHOC',
    'CONGNGHE',
    'NGOAINGU',
  ] as const;
  private static readonly FOREIGN_LANGUAGE_CODES = ['ANH', 'PHAP', 'DUC', 'NHAT', 'HAN', 'NGA', 'TRUNG'] as const;

  private static readonly FOREIGN_LANGUAGE_NAME_BY_CODE: Record<string, string> = {
    ANH: 'Tiếng Anh',
    PHAP: 'Tiếng Pháp',
    DUC: 'Tiếng Đức',
    NHAT: 'Tiếng Nhật',
    HAN: 'Tiếng Hàn',
    NGA: 'Tiếng Nga',
    TRUNG: 'Tiếng Trung',
  };

  private static readonly SUBJECT_NAME_BY_CODE: Record<string, string> = {
    TOAN: 'Toán',
    VAN: 'Ngữ văn',
    LY: 'Vật lý',
    HOA: 'Hóa học',
    SINH: 'Sinh học',
    SU: 'Lịch sử',
    DIA: 'Địa lý',
    GDKTPL: 'GDKT và PL',
    TINHOC: 'Tin học',
    CONGNGHE: 'Công nghệ',
    NGOAINGU: 'Ngoại ngữ',
  };

  private static async getCandidateIdByUserId(userId: number): Promise<number | null> {
    const [candidateRows] = await pool.execute<RowDataPacket[]>(
      `SELECT citizen_id FROM candidate_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (!candidateRows.length) return null;
    return Number(candidateRows[0].citizen_id);
  }

  private static async getCandidateIdByCitizenId(citizenId: number): Promise<number | null> {
    const [candidateRows] = await pool.execute<RowDataPacket[]>(
      `SELECT citizen_id FROM candidate_profiles WHERE citizen_id = ? LIMIT 1`,
      [citizenId]
    );
    if (!candidateRows.length) return null;
    return Number(candidateRows[0].citizen_id);
  }

  private static toNullableNumber(value: string | number | null): number | null {
    if (value === null) return null;
    return typeof value === 'number' ? value : Number(value);
  }

  private static mapAcademicProgress(rows: AcademicProgressRow[]): CandidateAcademicRecordFull['academic_progress'] {
    const result: CandidateAcademicRecordFull['academic_progress'] = {
      grade_10: {},
      grade_11: {},
      grade_12: {},
    };

    for (const row of rows) {
      if (row.grade_level === 10) {
        result.grade_10 = {
          school_name: row.school_name,
          avg_score: this.toNullableNumber(row.avg_score),
        };
      }
      if (row.grade_level === 11) {
        result.grade_11 = {
          school_name: row.school_name,
          avg_score: this.toNullableNumber(row.avg_score),
        };
      }
      if (row.grade_level === 12) {
        result.grade_12 = {
          school_name: row.school_name,
          avg_score: this.toNullableNumber(row.avg_score),
        };
      }
    }

    return result;
  }

  private static async getAcademicByCandidateId(candidateId: number): Promise<CandidateAcademicRecordFull> {
    const [recordRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, graduation_year, priority_score
       FROM academic_records
       WHERE candidate_id = ?
       LIMIT 1`,
      [candidateId]
    );

    if (!recordRows.length) {
      return {
        academic_record: null,
        academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
      };
    }

    const record = recordRows[0] as unknown as AcademicRecordRow;
    const [progressRows] = await pool.execute<RowDataPacket[]>(
      `SELECT grade_level, school_name, avg_score
       FROM academic_progress
       WHERE record_id = ?`,
      [record.id]
    );
    const [subjectScoreRows] = await pool.execute<RowDataPacket[]>(
      `SELECT subject_code, is_required, score
       FROM exam_scores
       WHERE record_id = ?
       ORDER BY subject_code ASC`,
      [record.id]
    );
    const [foreignLanguageRows] = await pool.execute<RowDataPacket[]>(
      `SELECT language_code, language_name
       FROM foreign_language_scores
       WHERE record_id = ?
       LIMIT 1`,
      [record.id]
    );

    return {
      academic_record: {
        id: record.id,
        candidate_id: record.candidate_id,
        graduation_year: record.graduation_year,
        priority_score: Number(record.priority_score),
        exam_scores: (subjectScoreRows as unknown as AcademicSubjectScoreRow[]).map((item) => ({
          subject_code: item.subject_code,
          subject_name: this.SUBJECT_NAME_BY_CODE[item.subject_code] ?? item.subject_code,
          is_required: Boolean(item.is_required),
          score: Number(item.score),
        })),
        foreign_language: foreignLanguageRows.length
          ? (foreignLanguageRows[0] as unknown as ForeignLanguageScoreRow)
          : null,
      },
      academic_progress: this.mapAcademicProgress(progressRows as unknown as AcademicProgressRow[]),
    };
  }

  private static async ensureAcademicRecordByCandidateId(candidateId: number): Promise<number> {
    await pool.execute(
      `INSERT INTO academic_records (candidate_id, priority_score)
       VALUES (?, 0)
       ON DUPLICATE KEY UPDATE candidate_id = candidate_id`,
      [candidateId]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_records WHERE candidate_id = ? LIMIT 1`,
      [candidateId]
    );

    return Number(rows[0].id);
  }

  static async getByUserId(userId: number): Promise<CandidateProfileJoined | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        u.id AS user_id,
        u.email,
        u.role,
        u.status,
        u.last_login_at,
        cp.citizen_id,
        cp.full_name,
        cp.phone,
        cp.date_of_birth,
        cp.gender,
        cp.citizen_issue_date,
        cp.citizen_issue_place,
        cp.religion,
        cp.ethnic,
        cp.nation,
        cp.province,
        cp.ward,
        cp.address
      FROM users u
      INNER JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE u.id = ?
      LIMIT 1`,
      [userId]
    );
    return rows.length ? (rows[0] as CandidateProfileJoined) : null;
  }

  static async getFullByUserId(userId: number): Promise<CandidateProfileFull | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;
    return this.toFullResponse(profile);
  }

  static toFullResponse(profile: CandidateProfileJoined): CandidateProfileFull {
    return {
      user: {
        id: profile.user_id,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        last_login_at: profile.last_login_at,
      },
      candidate_profile: {
        citizen_id: profile.citizen_id,
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        citizen_issue_date: profile.citizen_issue_date,
        citizen_issue_place: profile.citizen_issue_place,
        religion: profile.religion,
        ethnic: profile.ethnic,
        nation: profile.nation,
        province: profile.province,
        ward: profile.ward,
        address: profile.address,
      },
    };
  }

  static async updateByUserId(
    userId: number,
    data: Partial<{
      full_name: string;
      phone: string | null;
      date_of_birth: string | null;
      gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
      citizen_issue_date: string | null;
      citizen_issue_place: string | null;
      religion: string | null;
      ethnic: string | null;
      nation: string | null;
      province: string | null;
      ward: string | null;
      address: string | null;
    }>
  ): Promise<CandidateProfileJoined | null> {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      return this.getByUserId(userId);
    }

    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE candidate_profiles SET ${fields}, updated_at = NOW() WHERE user_id = ?`,
      [...values, userId]
    );
    if (result.affectedRows === 0) return null;
    return this.getByUserId(userId);
  }

  static async getAcademicByUserId(userId: number): Promise<CandidateAcademicRecordFull | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;
    return this.getAcademicByCandidateId(candidateId);
  }

  static async upsertAcademicRecordByUserId(
    userId: number,
    data: Partial<{
      graduation_year: number | null;
      priority_score: number | null;
      exam_scores: Array<{ subject_code: string; score: number }>;
    }>
  ): Promise<CandidateAcademicRecordFull | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;

    const [recordRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_records WHERE candidate_id = ? LIMIT 1`,
      [candidateId]
    );
    const entries = Object.entries(data).filter(
      ([key, value]) => key !== 'exam_scores' && value !== undefined
    );

    if (!recordRows.length) {
      const insertFields = ['candidate_id', ...entries.map(([key]) => key)];
      const insertValues = [candidateId, ...entries.map(([, value]) => value)];
      const placeholders = insertFields.map(() => '?').join(', ');
      await pool.execute(
        `INSERT INTO academic_records (${insertFields.join(', ')}) VALUES (${placeholders})`,
        insertValues
      );
    } else if (entries.length > 0) {
      const updateClause = entries.map(([key]) => `${key} = ?`).join(', ');
      const updateValues = entries.map(([, value]) => value);
      await pool.execute(
        `UPDATE academic_records SET ${updateClause}, updated_at = NOW() WHERE candidate_id = ?`,
        [...updateValues, candidateId]
      );
    }

    const [currentRecordRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_records WHERE candidate_id = ? LIMIT 1`,
      [candidateId]
    );
    if (currentRecordRows.length && data.exam_scores && data.exam_scores.length > 0) {
      const recordId = Number(currentRecordRows[0].id);
      for (const item of data.exam_scores) {
        await pool.execute(
          `INSERT INTO exam_scores (record_id, subject_code, score)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE score = VALUES(score)`,
          [recordId, item.subject_code, item.score]
        );
      }
    }

    return this.getAcademicByUserId(userId);
  }

  static async ensureAcademicRecordByUserId(userId: number): Promise<CandidateAcademicRecordFull | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;
    await this.ensureAcademicRecordByCandidateId(candidateId);
    return this.getAcademicByCandidateId(candidateId);
  }

  static async upsertExamScoresByGroupForCandidateByCitizenId(
    citizenId: number,
    payload: CandidateExamScoresPayload
  ): Promise<CandidateAcademicRecordFull | null> {
    const candidateId = await this.getCandidateIdByCitizenId(citizenId);
    if (!candidateId) return null;

    return this.upsertExamScoresByGroupForCandidateId(candidateId, payload);
  }

  static async upsertExamScoresByGroupForCandidateByUserId(
    userId: number,
    payload: CandidateExamScoresPayload
  ): Promise<CandidateAcademicRecordFull | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;

    return this.upsertExamScoresByGroupForCandidateId(candidateId, payload);
  }

  private static async upsertExamScoresByGroupForCandidateId(
    candidateId: number,
    payload: CandidateExamScoresPayload
  ): Promise<CandidateAcademicRecordFull> {
    const recordId = await this.ensureAcademicRecordByCandidateId(candidateId);
    const scoreKeys = Object.keys(payload.scores);
    if (scoreKeys.length !== 4) {
      throw new Error('scores must contain exactly 4 subjects');
    }

    const missingRequired = this.REQUIRED_SUBJECT_CODES.filter((code) => !scoreKeys.includes(code));
    if (missingRequired.length > 0) {
      throw new Error(`scores must include required subjects: ${missingRequired.join(', ')}`);
    }

    const optionalCodes = scoreKeys.filter((code) => !this.REQUIRED_SUBJECT_CODES.includes(code as 'TOAN' | 'VAN'));
    if (optionalCodes.length !== 2) {
      throw new Error('scores must include exactly 2 optional subjects');
    }

    const invalidOptionalCodes = optionalCodes.filter(
      (code) => !this.OPTIONAL_SUBJECT_CODES.includes(code as (typeof this.OPTIONAL_SUBJECT_CODES)[number])
    );
    if (invalidOptionalCodes.length > 0) {
      throw new Error(`invalid optional subjects: ${invalidOptionalCodes.join(', ')}`);
    }

    const hasForeignLanguageSubject = scoreKeys.includes('NGOAINGU');
    if (hasForeignLanguageSubject && !payload.foreign_language?.language_code) {
      throw new Error('foreign_language.language_code is required when NGOAINGU is selected');
    }
    if (!hasForeignLanguageSubject && payload.foreign_language) {
      throw new Error('foreign_language is only allowed when NGOAINGU is selected');
    }

    const foreignLanguageCode = payload.foreign_language?.language_code;
    if (
      foreignLanguageCode &&
      !this.FOREIGN_LANGUAGE_CODES.includes(
        foreignLanguageCode as (typeof this.FOREIGN_LANGUAGE_CODES)[number]
      )
    ) {
      throw new Error(
        `foreign_language.language_code must be one of: ${this.FOREIGN_LANGUAGE_CODES.join(', ')}`
      );
    }

    await pool.execute(`DELETE FROM foreign_language_scores WHERE record_id = ?`, [recordId]);
    await pool.execute(`DELETE FROM exam_scores WHERE record_id = ?`, [recordId]);

    for (const subjectCode of scoreKeys) {
      const isRequired = this.REQUIRED_SUBJECT_CODES.includes(subjectCode as 'TOAN' | 'VAN');
      const score = payload.scores[subjectCode];
      await pool.execute(
        `INSERT INTO exam_scores (record_id, subject_code, is_required, score)
         VALUES (?, ?, ?, ?)`,
        [recordId, subjectCode, isRequired, score]
      );
    }

    if (hasForeignLanguageSubject && foreignLanguageCode) {
      const languageName = this.FOREIGN_LANGUAGE_NAME_BY_CODE[foreignLanguageCode];
      await pool.execute(
        `INSERT INTO foreign_language_scores (record_id, language_code, language_name)
         VALUES (?, ?, ?)`,
        [recordId, foreignLanguageCode, languageName]
      );
    }

    await pool.execute(`UPDATE academic_records SET updated_at = NOW() WHERE id = ?`, [recordId]);

    return this.getAcademicByCandidateId(candidateId);
  }

  static async upsertAcademicProgressByUserId(
    userId: number,
    progress: {
      grade_10?: CandidateAcademicProgressPayload;
      grade_11?: CandidateAcademicProgressPayload;
      grade_12?: CandidateAcademicProgressPayload;
    }
  ): Promise<CandidateAcademicRecordFull | null> {
    const ensuredRecord = await this.ensureAcademicRecordByUserId(userId);
    if (!ensuredRecord?.academic_record) return ensuredRecord;

    const recordId = ensuredRecord.academic_record.id;
    if (!recordId) return ensuredRecord;

    const entries: Array<[10 | 11 | 12, CandidateAcademicProgressPayload | undefined]> = [
      [10, progress.grade_10],
      [11, progress.grade_11],
      [12, progress.grade_12],
    ];

    for (const [gradeLevel, value] of entries) {
      if (!value) continue;
      const [existingRows] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM academic_progress WHERE record_id = ? AND grade_level = ? ORDER BY id ASC LIMIT 1`,
        [recordId, gradeLevel]
      );
      if (existingRows.length) {
        await pool.execute(
          `UPDATE academic_progress
           SET school_name = ?, avg_score = ?
           WHERE id = ?`,
          [value.school_name ?? null, value.avg_score ?? null, existingRows[0].id]
        );
      } else {
        await pool.execute(
          `INSERT INTO academic_progress (record_id, grade_level, school_name, avg_score)
           VALUES (?, ?, ?, ?)`,
          [recordId, gradeLevel, value.school_name ?? null, value.avg_score ?? null]
        );
      }
    }

    return this.getAcademicByUserId(userId);
  }

  static async listDocumentsByUserId(userId: number): Promise<CandidateDocumentItem[] | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, document_type, file_name, file_url, file_type, file_size, uploaded_at, deleted_at
       FROM candidate_documents
       WHERE candidate_id = ? AND deleted_at IS NULL
       ORDER BY uploaded_at DESC`,
      [candidateId]
    );

    return (rows as unknown as CandidateDocumentRow[]).map((item) => ({
      id: item.id,
      document_type: item.document_type,
      file_name: item.file_name,
      file_url: item.file_url,
      file_type: item.file_type,
      file_size: item.file_size,
      uploaded_at: item.uploaded_at,
    }));
  }

  static async createDocumentByUserId(
    userId: number,
    data: {
      document_type: CandidateDocumentType;
      file_name: string;
      file_url: string;
      file_type: 'PDF' | 'JPEG' | 'PNG';
      file_size: number | null;
    }
  ): Promise<CandidateDocumentItem | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO candidate_documents (candidate_id, document_type, file_name, file_url, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [candidateId, data.document_type, data.file_name, data.file_url, data.file_type, data.file_size]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, document_type, file_name, file_url, file_type, file_size, uploaded_at, deleted_at
       FROM candidate_documents
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );
    if (!rows.length) return null;

    const item = rows[0] as unknown as CandidateDocumentRow;
    return {
      id: item.id,
      document_type: item.document_type,
      file_name: item.file_name,
      file_url: item.file_url,
      file_type: item.file_type,
      file_size: item.file_size,
      uploaded_at: item.uploaded_at,
    };
  }

  static async findDocumentByUserId(
    userId: number,
    documentId: number
  ): Promise<CandidateDocumentRow | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, candidate_id, document_type, file_name, file_url, file_type, file_size, uploaded_at, deleted_at
       FROM candidate_documents
       WHERE id = ? AND candidate_id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [documentId, candidateId]
    );
    if (!rows.length) return null;
    return rows[0] as unknown as CandidateDocumentRow;
  }

  static async softDeleteDocumentByUserId(userId: number, documentId: number): Promise<boolean | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE candidate_documents
       SET deleted_at = NOW()
       WHERE id = ? AND candidate_id = ? AND deleted_at IS NULL`,
      [documentId, candidateId]
    );
    return result.affectedRows > 0;
  }

  static async softDeleteDocumentsByTypeByUserId(
    userId: number,
    documentType: CandidateDocumentType
  ): Promise<boolean | null> {
    const candidateId = await this.getCandidateIdByUserId(userId);
    if (!candidateId) return null;
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE candidate_documents
       SET deleted_at = NOW()
       WHERE candidate_id = ? AND document_type = ? AND deleted_at IS NULL`,
      [candidateId, documentType]
    );
    return result.affectedRows > 0;
  }
}
