import fs from 'fs/promises';
import path from 'path';
import { ekycConfig } from '../config/ekyc';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import {
  CandidateIdentityVerificationModel,
  type EkycStatusSummary,
} from '../models/candidate-identity-verification.model';

type OcrResult = {
  errorCode: string | number;
  typeNew: string | null;
  citizenId: string | null;
};

type FaceMatchResult = {
  isMatch: boolean;
  similarity: number;
};

type DocumentInput = {
  file_url: string;
  file_name: string;
  file_type: 'PDF' | 'JPEG' | 'PNG';
};

type ProviderFailureCode =
  | 'EKYC_PROVIDER_CONFIG_MISSING'
  | 'EKYC_PROVIDER_ERROR'
  | 'EKYC_PROVIDER_TIMEOUT'
  | 'EKYC_DOCUMENT_DOWNLOAD_FAILED'
  | 'EKYC_WRONG_SIDE'
  | 'EKYC_CITIZEN_ID_MISMATCH'
  | 'EKYC_FACE_MISMATCH'
  | 'EKYC_FRONT_NOT_VERIFIED';

export class EkycError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ProviderFailureCode,
    message: string
  ) {
    super(message);
  }
}

const documentMimeByType: Record<DocumentInput['file_type'], string> = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
};

const sanitizeFailure = (message: string): string => message.slice(0, 255);

const validFrontTypes = new Set(['cccd_12_front', 'cc_front']);
const validBackTypes = new Set(['new_back', 'cc_back']);

const normalizeCitizenId = (value: string | number | null | undefined): string | null => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return digits.padStart(12, '0');
};

const extractOcrPayload = (raw: any): any => {
  if (Array.isArray(raw?.data)) return raw.data[0] ?? {};
  if (Array.isArray(raw)) return raw[0] ?? {};
  return raw?.data ?? raw ?? {};
};

const normalizeOcrResult = (raw: any): OcrResult => {
  const payload = extractOcrPayload(raw);
  return {
    errorCode: raw?.errorCode ?? raw?.error_code ?? payload?.errorCode ?? payload?.error_code ?? 0,
    typeNew: payload?.type_new ?? payload?.type ?? null,
    citizenId: normalizeCitizenId(payload?.id ?? payload?.id_number ?? payload?.citizen_id),
  };
};

const normalizeFaceResult = (raw: any): FaceMatchResult => {
  const payload = raw?.data ?? raw ?? {};
  const similarity = Number(payload?.similarity ?? payload?.confidence ?? payload?.score ?? 0);
  return {
    isMatch: Boolean(payload?.isMatch ?? payload?.is_match ?? raw?.isMatch ?? false),
    similarity,
  };
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new EkycError(503, 'EKYC_PROVIDER_TIMEOUT', 'eKYC provider timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const downloadDocumentBuffer = async (document: DocumentInput): Promise<Buffer> => {
  try {
    if (document.file_url.startsWith('/uploads/')) {
      const filePath = path.resolve(__dirname, '../../', document.file_url.replace(/^\//, ''));
      return await fs.readFile(filePath);
    }

    const response = await fetchWithTimeout(document.file_url, {}, ekycConfig.timeoutMs);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } catch {
    throw new EkycError(502, 'EKYC_DOCUMENT_DOWNLOAD_FAILED', 'Cannot read uploaded document');
  }
};

const appendDocument = (
  form: FormData,
  name: string,
  buffer: Buffer,
  document: DocumentInput
): void => {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: documentMimeByType[document.file_type] });
  form.append(name, blob, document.file_name || `${name}.jpg`);
};

export type EkycProvider = {
  verifyIdDocument(document: DocumentInput): Promise<OcrResult>;
  compareFaces(frontDocument: DocumentInput, portraitDocument: DocumentInput): Promise<FaceMatchResult>;
};

const fptProvider: EkycProvider = {
  async verifyIdDocument(document) {
    if (!ekycConfig.fptApiKey) {
      throw new EkycError(503, 'EKYC_PROVIDER_CONFIG_MISSING', 'eKYC provider is not configured');
    }

    const buffer = await downloadDocumentBuffer(document);
    const form = new FormData();
    appendDocument(form, 'image', buffer, document);

    const response = await fetchWithTimeout(
      ekycConfig.idrEndpoint,
      {
        method: 'POST',
        headers: { 'api-key': ekycConfig.fptApiKey },
        body: form,
      },
      ekycConfig.timeoutMs
    );

    if (!response.ok) {
      throw new EkycError(502, 'EKYC_PROVIDER_ERROR', 'eKYC provider rejected OCR request');
    }

    return normalizeOcrResult(await response.json());
  },

  async compareFaces(frontDocument, portraitDocument) {
    if (!ekycConfig.fptApiKey) {
      throw new EkycError(503, 'EKYC_PROVIDER_CONFIG_MISSING', 'eKYC provider is not configured');
    }

    const [frontBuffer, portraitBuffer] = await Promise.all([
      downloadDocumentBuffer(frontDocument),
      downloadDocumentBuffer(portraitDocument),
    ]);
    const form = new FormData();
    appendDocument(form, 'file[]', frontBuffer, frontDocument);
    appendDocument(form, 'file[]', portraitBuffer, portraitDocument);

    const response = await fetchWithTimeout(
      ekycConfig.faceEndpoint,
      {
        method: 'POST',
        headers: { 'api-key': ekycConfig.fptApiKey },
        body: form,
      },
      ekycConfig.timeoutMs
    );

    if (!response.ok) {
      throw new EkycError(502, 'EKYC_PROVIDER_ERROR', 'eKYC provider rejected face matching request');
    }

    return normalizeFaceResult(await response.json());
  },
};

export const ekycDeps = {
  provider: fptProvider,
};

export class EkycService {
  static async getStatus(userId: number): Promise<EkycStatusSummary> {
    return CandidateIdentityVerificationModel.getOrDefaultByUserId(userId);
  }

  static async verifyFront(userId: number, documentId: number): Promise<EkycStatusSummary> {
    const [profile, document] = await Promise.all([
      CandidateProfileModel.getByUserId(userId),
      CandidateIdentityVerificationModel.assertActiveDocumentForUser(userId, documentId, 'CITIZEN_ID_Front'),
    ]);
    if (!profile) {
      throw new EkycError(404, 'EKYC_PROVIDER_ERROR', 'Candidate profile not found');
    }

    const current = await CandidateIdentityVerificationModel.getOrDefaultByUserId(userId);
    const ocr = await ekycDeps.provider.verifyIdDocument(document);
    if (String(ocr.errorCode) !== '0' || !validFrontTypes.has(ocr.typeNew ?? '')) {
      return CandidateIdentityVerificationModel.upsertByUserId(userId, {
        front_document_id: documentId,
        front_status: 'FAILED',
        overall_status: 'FAILED',
        failure_reason: sanitizeFailure('CCCD front side is invalid'),
        verified_at: null,
      });
    }

    const profileCitizenId = normalizeCitizenId(profile.citizen_id);
    if (ocr.citizenId && profileCitizenId && ocr.citizenId !== profileCitizenId) {
      return CandidateIdentityVerificationModel.upsertByUserId(userId, {
        front_document_id: documentId,
        front_status: 'FAILED',
        overall_status: 'FAILED',
        failure_reason: sanitizeFailure('Citizen ID does not match profile'),
        verified_at: null,
      });
    }

    const overall = CandidateIdentityVerificationModel.calculateOverallStatus(
      'VERIFIED',
      current.back_status,
      current.face_status
    );
    return CandidateIdentityVerificationModel.upsertByUserId(userId, {
      front_document_id: documentId,
      front_status: 'VERIFIED',
      overall_status: overall,
      failure_reason: null,
      verified_at: overall === 'VERIFIED' ? new Date() : current.verified_at,
    });
  }

  static async verifyBack(userId: number, documentId: number): Promise<EkycStatusSummary> {
    const document = await CandidateIdentityVerificationModel.assertActiveDocumentForUser(
      userId,
      documentId,
      'CITIZEN_ID_Back'
    );
    const current = await CandidateIdentityVerificationModel.getOrDefaultByUserId(userId);
    const ocr = await ekycDeps.provider.verifyIdDocument(document);
    if (String(ocr.errorCode) !== '0' || !validBackTypes.has(ocr.typeNew ?? '')) {
      return CandidateIdentityVerificationModel.upsertByUserId(userId, {
        back_document_id: documentId,
        back_status: 'FAILED',
        overall_status: 'FAILED',
        failure_reason: sanitizeFailure('CCCD back side is invalid'),
        verified_at: null,
      });
    }

    const overall = CandidateIdentityVerificationModel.calculateOverallStatus(
      current.front_status,
      'VERIFIED',
      current.face_status
    );
    return CandidateIdentityVerificationModel.upsertByUserId(userId, {
      back_document_id: documentId,
      back_status: 'VERIFIED',
      overall_status: overall,
      failure_reason: null,
      verified_at: overall === 'VERIFIED' ? new Date() : current.verified_at,
    });
  }

  static async verifyFace(
    userId: number,
    frontDocumentId: number,
    portraitDocumentId: number
  ): Promise<EkycStatusSummary> {
    const current = await CandidateIdentityVerificationModel.getOrDefaultByUserId(userId);
    if (current.front_status !== 'VERIFIED' || current.front_document_id !== frontDocumentId) {
      throw new EkycError(409, 'EKYC_FRONT_NOT_VERIFIED', 'Citizen ID front document is not verified');
    }

    const [frontDocument, portraitDocument] = await Promise.all([
      CandidateIdentityVerificationModel.assertActiveDocumentForUser(userId, frontDocumentId, 'CITIZEN_ID_Front'),
      CandidateIdentityVerificationModel.assertActiveDocumentForUser(userId, portraitDocumentId, 'PORTRAIT'),
    ]);

    const face = await ekycDeps.provider.compareFaces(frontDocument, portraitDocument);
    if (!face.isMatch || face.similarity < ekycConfig.similarityThreshold) {
      return CandidateIdentityVerificationModel.upsertByUserId(userId, {
        portrait_document_id: portraitDocumentId,
        face_status: 'FAILED',
        similarity: face.similarity,
        overall_status: 'FAILED',
        failure_reason: sanitizeFailure('Portrait does not match citizen ID'),
        verified_at: null,
      });
    }

    const overall = CandidateIdentityVerificationModel.calculateOverallStatus(
      current.front_status,
      current.back_status,
      'VERIFIED'
    );
    return CandidateIdentityVerificationModel.upsertByUserId(userId, {
      portrait_document_id: portraitDocumentId,
      face_status: 'VERIFIED',
      similarity: face.similarity,
      overall_status: overall,
      failure_reason: null,
      verified_at: overall === 'VERIFIED' ? new Date() : current.verified_at,
    });
  }
}
