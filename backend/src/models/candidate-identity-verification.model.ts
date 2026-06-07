import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import type { CandidateDocumentItem } from './candidate-profile.model';

export type EkycStepStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type EkycOverallStatus = 'UNVERIFIED' | 'PARTIAL' | 'VERIFIED' | 'FAILED';

export type EkycDocumentType =
  | 'CITIZEN_ID_Front'
  | 'CITIZEN_ID_Back'
  | 'PORTRAIT';

export interface CandidateIdentityVerification {
  id: number;
  user_id: number;
  front_document_id: number | null;
  back_document_id: number | null;
  portrait_document_id: number | null;
  front_status: EkycStepStatus;
  back_status: EkycStepStatus;
  face_status: EkycStepStatus;
  overall_status: EkycOverallStatus;
  similarity: number | null;
  failure_reason: string | null;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type EkycStatusSummary = Omit<CandidateIdentityVerification, 'created_at' | 'updated_at'>;

type CandidateDocumentForVerification = CandidateDocumentItem & {
  candidate_id: number;
  deleted_at: Date | null;
};

const toSummary = (row: CandidateIdentityVerification): EkycStatusSummary => ({
  id: row.id,
  user_id: row.user_id,
  front_document_id: row.front_document_id,
  back_document_id: row.back_document_id,
  portrait_document_id: row.portrait_document_id,
  front_status: row.front_status,
  back_status: row.back_status,
  face_status: row.face_status,
  overall_status: row.overall_status,
  similarity: row.similarity === null ? null : Number(row.similarity),
  failure_reason: row.failure_reason,
  verified_at: row.verified_at,
});

export class CandidateIdentityVerificationModel {
  static defaultStatus(userId: number): EkycStatusSummary {
    return {
      id: 0,
      user_id: userId,
      front_document_id: null,
      back_document_id: null,
      portrait_document_id: null,
      front_status: 'PENDING',
      back_status: 'PENDING',
      face_status: 'PENDING',
      overall_status: 'UNVERIFIED',
      similarity: null,
      failure_reason: null,
      verified_at: null,
    };
  }

  static async getByUserId(userId: number): Promise<EkycStatusSummary | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, user_id, front_document_id, back_document_id, portrait_document_id,
              front_status, back_status, face_status, overall_status, similarity,
              failure_reason, verified_at, created_at, updated_at
       FROM candidate_identity_verifications
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    return rows.length
      ? toSummary(rows[0] as unknown as CandidateIdentityVerification)
      : null;
  }

  static async getOrDefaultByUserId(userId: number): Promise<EkycStatusSummary> {
    return (await this.getByUserId(userId)) ?? this.defaultStatus(userId);
  }

  static async upsertByUserId(
    userId: number,
    data: Partial<{
      front_document_id: number | null;
      back_document_id: number | null;
      portrait_document_id: number | null;
      front_status: EkycStepStatus;
      back_status: EkycStepStatus;
      face_status: EkycStepStatus;
      overall_status: EkycOverallStatus;
      similarity: number | null;
      failure_reason: string | null;
      verified_at: Date | null;
    }>
  ): Promise<EkycStatusSummary> {
    await pool.execute(
      `INSERT INTO candidate_identity_verifications (user_id)
       VALUES (?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId]
    );

    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (entries.length > 0) {
      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      await pool.execute(
        `UPDATE candidate_identity_verifications
         SET ${fields}, updated_at = NOW()
         WHERE user_id = ?`,
        [...entries.map(([, value]) => value), userId]
      );
    }

    const status = await this.getByUserId(userId);
    if (!status) throw new Error('Failed to fetch eKYC status');
    return status;
  }

  static async findActiveDocumentForUser(
    userId: number,
    documentId: number
  ): Promise<CandidateDocumentForVerification | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT cd.id, cd.candidate_id, cd.document_type, cd.file_name, cd.display_name,
              cd.file_url, cd.file_type, cd.file_size, cd.uploaded_at, cd.deleted_at
       FROM candidate_documents cd
       INNER JOIN candidate_profiles cp ON cp.citizen_id = cd.candidate_id
       WHERE cp.user_id = ?
         AND cd.id = ?
         AND cd.deleted_at IS NULL
       LIMIT 1`,
      [userId, documentId]
    );

    return rows.length ? (rows[0] as unknown as CandidateDocumentForVerification) : null;
  }

  static async assertActiveDocumentForUser(
    userId: number,
    documentId: number,
    expectedType: EkycDocumentType
  ): Promise<CandidateDocumentForVerification> {
    const document = await this.findActiveDocumentForUser(userId, documentId);
    if (!document) {
      const error = new Error('Document not found');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    if (document.document_type !== expectedType) {
      const error = new Error(`Document type must be ${expectedType}`);
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    return document;
  }

  static async isVerified(userId: number): Promise<boolean> {
    const status = await this.getByUserId(userId);
    return status?.overall_status === 'VERIFIED';
  }

  static calculateOverallStatus(
    frontStatus: EkycStepStatus,
    backStatus: EkycStepStatus,
    faceStatus: EkycStepStatus
  ): EkycOverallStatus {
    if (frontStatus === 'VERIFIED' && backStatus === 'VERIFIED' && faceStatus === 'VERIFIED') {
      return 'VERIFIED';
    }
    if (frontStatus === 'FAILED' || backStatus === 'FAILED' || faceStatus === 'FAILED') {
      return 'FAILED';
    }
    if (frontStatus === 'VERIFIED' || backStatus === 'VERIFIED' || faceStatus === 'VERIFIED') {
      return 'PARTIAL';
    }
    return 'UNVERIFIED';
  }

  static async resetForDeletedDocument(userId: number, documentId: number): Promise<void> {
    const current = await this.getByUserId(userId);
    if (!current) return;

    const patch: Partial<{
      front_document_id: number | null;
      back_document_id: number | null;
      portrait_document_id: number | null;
      front_status: EkycStepStatus;
      back_status: EkycStepStatus;
      face_status: EkycStepStatus;
      overall_status: EkycOverallStatus;
      similarity: number | null;
      failure_reason: string | null;
      verified_at: Date | null;
    }> = {};

    let frontStatus = current.front_status;
    let backStatus = current.back_status;
    let faceStatus = current.face_status;

    if (current.front_document_id === documentId) {
      patch.front_document_id = null;
      patch.front_status = 'PENDING';
      patch.portrait_document_id = null;
      patch.face_status = 'PENDING';
      patch.similarity = null;
      frontStatus = 'PENDING';
      faceStatus = 'PENDING';
    }
    if (current.back_document_id === documentId) {
      patch.back_document_id = null;
      patch.back_status = 'PENDING';
      backStatus = 'PENDING';
    }
    if (current.portrait_document_id === documentId) {
      patch.portrait_document_id = null;
      patch.face_status = 'PENDING';
      patch.similarity = null;
      faceStatus = 'PENDING';
    }

    if (!Object.keys(patch).length) return;

    patch.overall_status = this.calculateOverallStatus(frontStatus, backStatus, faceStatus);
    if (patch.overall_status !== 'VERIFIED') patch.verified_at = null;
    patch.failure_reason = null;

    await this.upsertByUserId(userId, patch);
  }
}
