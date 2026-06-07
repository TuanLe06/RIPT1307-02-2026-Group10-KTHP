import assert from 'node:assert/strict';
import {
  candidateDocumentDeps,
  deleteCandidateDocument,
  getCandidateAcademicRecord,
  listCandidateDocuments,
  getCandidateProfile,
  uploadCandidateDocument,
  upsertCandidateExamScoresByGroup,
  upsertCandidateAcademicProgress,
  upsertCandidateAcademicRecord,
  updateCandidateProfile,
} from '../controllers/candidate-profile.controller';
import pool from '../config/database';
import { requireCompleteProfile } from '../middleware/requireCompleteProfile.middleware';
import {
  CandidateProfileModel,
  type CandidateDocumentItem,
} from '../models/candidate-profile.model';
import { CandidateIdentityVerificationModel } from '../models/candidate-identity-verification.model';
import { authenticate, authorize } from '../middleware/auth.middleware';

type MockResponse = {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
};

const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const original = {
  getByUserId: CandidateProfileModel.getByUserId,
  getFullByUserId: CandidateProfileModel.getFullByUserId,
  updateByUserId: CandidateProfileModel.updateByUserId,
  getAcademicByUserId: CandidateProfileModel.getAcademicByUserId,
  upsertAcademicRecordByUserId: CandidateProfileModel.upsertAcademicRecordByUserId,
  upsertAcademicProgressByUserId: CandidateProfileModel.upsertAcademicProgressByUserId,
  upsertExamScoresByGroupForCandidateByUserId: CandidateProfileModel.upsertExamScoresByGroupForCandidateByUserId,
  upsertExamScoresByGroupForCandidateByCitizenId: CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId,
  listDocumentsByUserId: CandidateProfileModel.listDocumentsByUserId,
  createDocumentByUserId: CandidateProfileModel.createDocumentByUserId,
  findDocumentByUserId: CandidateProfileModel.findDocumentByUserId,
  softDeleteDocumentByUserId: CandidateProfileModel.softDeleteDocumentByUserId,
  softDeleteDocumentsByTypeByUserId: CandidateProfileModel.softDeleteDocumentsByTypeByUserId,
  isIdentityVerified: CandidateIdentityVerificationModel.isVerified,
  resetForDeletedDocument: CandidateIdentityVerificationModel.resetForDeletedDocument,
  poolExecute: pool.execute,
  uploadDocumentBuffer: candidateDocumentDeps.uploadDocumentBuffer,
  deleteAssetByPublicId: candidateDocumentDeps.deleteAssetByPublicId,
};

const restore = (): void => {
  CandidateProfileModel.getByUserId = original.getByUserId;
  CandidateProfileModel.getFullByUserId = original.getFullByUserId;
  CandidateProfileModel.updateByUserId = original.updateByUserId;
  CandidateProfileModel.getAcademicByUserId = original.getAcademicByUserId;
  CandidateProfileModel.upsertAcademicRecordByUserId = original.upsertAcademicRecordByUserId;
  CandidateProfileModel.upsertAcademicProgressByUserId = original.upsertAcademicProgressByUserId;
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByUserId =
    original.upsertExamScoresByGroupForCandidateByUserId;
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId =
    original.upsertExamScoresByGroupForCandidateByCitizenId;
  CandidateProfileModel.listDocumentsByUserId = original.listDocumentsByUserId;
  CandidateProfileModel.createDocumentByUserId = original.createDocumentByUserId;
  CandidateProfileModel.findDocumentByUserId = original.findDocumentByUserId;
  CandidateProfileModel.softDeleteDocumentByUserId = original.softDeleteDocumentByUserId;
  CandidateProfileModel.softDeleteDocumentsByTypeByUserId = original.softDeleteDocumentsByTypeByUserId;
  CandidateIdentityVerificationModel.isVerified = original.isIdentityVerified;
  CandidateIdentityVerificationModel.resetForDeletedDocument = original.resetForDeletedDocument;
  pool.execute = original.poolExecute;
  candidateDocumentDeps.uploadDocumentBuffer = original.uploadDocumentBuffer;
  candidateDocumentDeps.deleteAssetByPublicId = original.deleteAssetByPublicId;
};

const sampleFlatProfile = {
   user_id: 1,
   email: 'candidate@example.com',
   role: 'CANDIDATE' as const,
   status: 'ACTIVE' as const,
   last_login_at: null,
   citizen_id: '123456789012',
   full_name: 'Nguyen Van A',
   phone: '0901234567',
   date_of_birth: new Date('2006-01-01'),
   gender: 'MALE' as const,
   citizen_issue_date: null,
   citizen_issue_place: null,
   religion: null,
   ethnic: null,
   nation: null,
   province: null,
   ward: null,
   address: null,
};

const testGetProfileSuccess = async (): Promise<void> => {
  CandidateProfileModel.getFullByUserId = async () => ({
    user: {
      id: 1,
      email: 'candidate@example.com',
      role: 'CANDIDATE',
      status: 'ACTIVE',
      last_login_at: null,
    },
    candidate_profile: {
citizen_id: '123456789012',
      full_name: 'Nguyen Van A',
      phone: '0901234567',
      date_of_birth: new Date('2006-01-01'),
      gender: 'MALE',
      citizen_issue_date: null,
      citizen_issue_place: null,
      religion: null,
      ethnic: null,
      nation: null,
      province: null,
      ward: null,
      address: null,
    },
  });
  const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
  const res = createMockResponse();
  await getCandidateProfile(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testGetProfileNotFound = async (): Promise<void> => {
  CandidateProfileModel.getFullByUserId = async () => null;
  const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
  const res = createMockResponse();
  await getCandidateProfile(req, res as any);
  assert.equal(res.statusCode, 404);
};

const testUpdateProfileValidationFail = async (): Promise<void> => {
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { gender: 'INVALID' },
    'express-validator#contexts': [{ errors: [{ msg: 'gender is invalid', path: 'gender', type: 'field' }] }],
  } as any;
  const res = createMockResponse();
  await updateCandidateProfile(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testUpdateProfileSuccess = async (): Promise<void> => {
  CandidateProfileModel.updateByUserId = async () => sampleFlatProfile;
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { full_name: 'Nguyen Van B' },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await updateCandidateProfile(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testAuthMiddlewareNoToken = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = { headers: {} } as any;
    const res = createMockResponse();
    authenticate(req, res as any, () => reject(new Error('next() should not be called')));
    try {
      assert.equal(res.statusCode, 401);
      resolve();
    } catch (error) {
      reject(error);
    }
  });

const testGetAcademicRecordSuccess = async (): Promise<void> => {
  CandidateProfileModel.getAcademicByUserId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toán', is_required: true, score: 8.5 },
        { subject_code: 'VAN', subject_name: 'Ngữ văn', is_required: true, score: 8.25 },
        { subject_code: 'LY', subject_name: 'Vật lý', is_required: false, score: 8.25 },
        { subject_code: 'NGOAINGU', subject_name: 'Ngoại ngữ', is_required: false, score: 8.0 },
      ],
      foreign_language: { language_code: 'ANH', language_name: 'Tiếng Anh' },
    },
    academic_progress: {
      grade_10: { school_name: 'THPT A', avg_score: 8.0 },
      grade_11: { school_name: 'THPT A', avg_score: 8.2 },
      grade_12: { school_name: 'THPT A', avg_score: 8.5 },
    },
  });

  const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
  const res = createMockResponse();
  await getCandidateAcademicRecord(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testUpsertAcademicRecordValidationFail = async (): Promise<void> => {
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { priority_score: 11 },
    'express-validator#contexts': [{ errors: [{ msg: 'priority_score must be between 0 and 10' }] }],
  } as any;
  const res = createMockResponse();
  await upsertCandidateAcademicRecord(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testUpsertAcademicRecordSuccess = async (): Promise<void> => {
  CandidateProfileModel.upsertAcademicRecordByUserId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toán', is_required: true, score: 8.5 },
        { subject_code: 'VAN', subject_name: 'Ngữ văn', is_required: true, score: 8.25 },
      ],
      foreign_language: null,
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: {
      graduation_year: 2024,
      priority_score: 1.5,
    },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateAcademicRecord(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testUpsertAcademicProgressSuccess = async (): Promise<void> => {
  CandidateProfileModel.upsertAcademicProgressByUserId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      priority_score: 0,
      exam_scores: [],
      foreign_language: null,
    },
    academic_progress: {
      grade_10: { school_name: 'THPT A', avg_score: 8.0 },
      grade_11: {},
      grade_12: {},
    },
  });

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { grade_10: { school_name: 'THPT A', avg_score: 8.0 } },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateAcademicProgress(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testCandidateUpsertGroupScoresNaturalSuccess = async (): Promise<void> => {
  candidateDocumentDeps.uploadDocumentBuffer = async () => ({
    publicId: 'folder/exam-certificate',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/exam-certificate.pdf',
    width: 0,
    height: 0,
    format: 'pdf',
    bytes: 12345,
    resourceType: 'raw',
  });
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByUserId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toán', is_required: true, score: 8.5 },
        { subject_code: 'VAN', subject_name: 'Ngữ văn', is_required: true, score: 8.25 },
        { subject_code: 'LY', subject_name: 'Vật lý', is_required: false, score: 8.25 },
        { subject_code: 'NGOAINGU', subject_name: 'Ngoại ngữ', is_required: false, score: 8.0 },
      ],
      foreign_language: { language_code: 'ANH', language_name: 'Tiếng Anh' },
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });

  let replacedDocumentType: string | null = null;
  CandidateProfileModel.softDeleteDocumentsByTypeByUserId = async (_userId, documentType) => {
    replacedDocumentType = documentType;
    return true;
  };

  let createdDocumentType: string | null = null;
  CandidateProfileModel.createDocumentByUserId = async (_userId, data) => {
    createdDocumentType = data.document_type;
    return {
      id: 100,
      document_type: data.document_type as CandidateDocumentItem['document_type'],
      file_name: data.file_name,
      display_name: data.display_name ?? null,
      file_url: data.file_url,
      file_type: data.file_type,
      file_size: data.file_size,
      uploaded_at: new Date(),
    };
  };

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: {
      scores: { TOAN: 8.5, VAN: 8.25, NGOAINGU: 8.0, LY: 8.25 },
      foreign_language: { language_code: 'ANH' },
    },
    file: {
      mimetype: 'application/pdf',
      originalname: 'exam-certificate.pdf',
      buffer: Buffer.from('fake'),
      size: 12345,
    },
    'express-validator#contexts': [],
  } as any;

  const res = createMockResponse();
  await upsertCandidateExamScoresByGroup(req, res as any);
  assert.equal(res.statusCode, 200);
  assert.equal(replacedDocumentType, 'EXAM_CERTIFICATE');
  assert.equal(createdDocumentType, 'EXAM_CERTIFICATE');
};

const testCandidateUpsertGroupScoresInvalidPayload = async (): Promise<void> => {
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { scores: { TOAN: 8.5 } },
    file: {
      mimetype: 'application/pdf',
      originalname: 'exam-certificate.pdf',
      buffer: Buffer.from('fake'),
      size: 12345,
    },
    'express-validator#contexts': [{ errors: [{ msg: 'scores must contain exactly 4 subjects' }] }],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroup(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testCandidateUpsertGroupScoresMissingCertificateFile = async (): Promise<void> => {
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { scores: { TOAN: 8.5, VAN: 8.25, LY: 8.25, HOA: 9 } },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroup(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testCandidateUpsertGroupScoresCandidateNotFound = async (): Promise<void> => {
  candidateDocumentDeps.uploadDocumentBuffer = async () => ({
    publicId: 'folder/exam-certificate',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/exam-certificate.pdf',
    width: 0,
    height: 0,
    format: 'pdf',
    bytes: 12345,
    resourceType: 'raw',
  });
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByUserId = async () => null;
  candidateDocumentDeps.deleteAssetByPublicId = async () => undefined;

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { scores: { TOAN: 8.5, VAN: 8.25, LY: 8.25, HOA: 9 } },
    file: {
      mimetype: 'application/pdf',
      originalname: 'exam-certificate.pdf',
      buffer: Buffer.from('fake'),
      size: 12345,
    },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroup(req, res as any);
  assert.equal(res.statusCode, 404);
};

const testCandidateUpsertGroupScoresMissingForeignLanguage = async (): Promise<void> => {
  candidateDocumentDeps.uploadDocumentBuffer = async () => ({
    publicId: 'folder/exam-certificate',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/exam-certificate.pdf',
    width: 0,
    height: 0,
    format: 'pdf',
    bytes: 12345,
    resourceType: 'raw',
  });
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByUserId = async () => {
    throw new Error('foreign_language.language_code is required when NGOAINGU is selected');
  };
  candidateDocumentDeps.deleteAssetByPublicId = async () => undefined;

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { scores: { TOAN: 8.5, VAN: 8.25, NGOAINGU: 8.25, LY: 8.0 } },
    file: {
      mimetype: 'application/pdf',
      originalname: 'exam-certificate.pdf',
      buffer: Buffer.from('fake'),
      size: 12345,
    },
    'express-validator#contexts': [],
  } as any;

  const res = createMockResponse();
  await upsertCandidateExamScoresByGroup(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testListDocumentsSuccess = async (): Promise<void> => {
  CandidateProfileModel.listDocumentsByUserId = async () => [
    {
      id: 1,
      document_type: 'TRANSCRIPT',
      file_name: 'doc1',
      display_name: null,
      file_url: 'https://res.cloudinary.com/demo/image/upload/v1/folder/doc1.pdf',
      file_type: 'PDF',
      file_size: 12345,
      uploaded_at: new Date(),
    },
  ];
  const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
  const res = createMockResponse();
  await listCandidateDocuments(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testUploadDocumentSuccess = async (): Promise<void> => {
  let ekycProviderCalled = false;
  candidateDocumentDeps.uploadDocumentBuffer = async () => ({
    publicId: 'folder/doc1',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/doc1.pdf',
    width: 0,
    height: 0,
    format: 'pdf',
    bytes: 12345,
    resourceType: 'raw',
  });
  CandidateProfileModel.createDocumentByUserId = async () => ({
    id: 1,
    document_type: 'CITIZEN_ID_Front',
    file_name: 'folder/doc1',
    display_name: null,
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/doc1.pdf',
    file_type: 'PDF',
    file_size: 12345,
    uploaded_at: new Date(),
  });
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_type: 'CITIZEN_ID_Front' },
    file: {
      mimetype: 'application/pdf',
      originalname: 'transcript.pdf',
      buffer: Buffer.from('fake'),
      size: 12345,
    },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await uploadCandidateDocument(req, res as any);
  assert.equal(res.statusCode, 201);
  assert.equal(ekycProviderCalled, false);
};

const testDeleteDocumentSuccess = async (): Promise<void> => {
  CandidateProfileModel.findDocumentByUserId = async () => ({
    id: 1,
    candidate_id: 123456789012,
    document_type: 'TRANSCRIPT',
    file_name: 'folder/doc1',
    display_name: null,
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/doc1.pdf',
    file_type: 'PDF',
    file_size: 12345,
    uploaded_at: new Date(),
    deleted_at: null,
  });
  candidateDocumentDeps.deleteAssetByPublicId = async () => undefined;
  CandidateProfileModel.softDeleteDocumentByUserId = async () => true;
  let resetDocumentId: number | null = null;
  CandidateIdentityVerificationModel.resetForDeletedDocument = async (_userId, documentId) => {
    resetDocumentId = documentId;
  };
  const req = { user: { id: 1, role: 'CANDIDATE' }, params: { documentId: '1' } } as any;
  const res = createMockResponse();
  await deleteCandidateDocument(req, res as any);
  assert.equal(res.statusCode, 200);
  assert.equal(resetDocumentId, 1);
};

const testAuthorizeWrongRole = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = { user: { id: 1, role: 'ADMIN' } } as any;
    const res = createMockResponse();
    const next = () => reject(new Error('next() should not be called'));
    authorize('CANDIDATE')(req, res as any, next);
    try {
      assert.equal(res.statusCode, 403);
      resolve();
    } catch (error) {
      reject(error);
    }
  });

const testRequireCompleteProfileMissingExamCertificate = (): Promise<void> =>
  new Promise((resolve, reject) => {
    CandidateIdentityVerificationModel.isVerified = async () => true;
    let callIndex = 0;
    pool.execute = (async () => {
      callIndex += 1;
      if (callIndex === 1) {
        return [[{ phone: '0901', date_of_birth: '2006-01-01', gender: 'MALE', province: 'HN', address: 'A' }], []] as any;
      }
      if (callIndex === 2) {
        return [[{ id: 5, graduation_year: 2024 }], []] as any;
      }
      if (callIndex === 3) {
        return [[{ subject_code: 'TOAN' }, { subject_code: 'VAN' }, { subject_code: 'LY' }, { subject_code: 'HOA' }], []] as any;
      }
      if (callIndex === 4) {
        return [[], []] as any;
      }
      if (callIndex === 5) {
        return [[{ school_name: 'THPT A' }], []] as any;
      }
      if (callIndex === 6) {
        return [[], []] as any;
      }
      return [[], []] as any;
    }) as any;

    const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
    const res = createMockResponse();
    requireCompleteProfile(req, res as any, () => reject(new Error('next() should not be called')))
      .then(() => {
        try {
          assert.equal(res.statusCode, 400);
          assert.equal((res.body as any).success, false);
          assert.ok(Array.isArray((res.body as any).missing_fields));
          assert.ok((res.body as any).missing_fields.includes('Giấy chứng nhận kết quả thi'));
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });

const testRequireCompleteProfileWithExamCertificate = (): Promise<void> =>
  new Promise((resolve, reject) => {
    CandidateIdentityVerificationModel.isVerified = async () => true;
    let callIndex = 0;
    pool.execute = (async () => {
      callIndex += 1;
      if (callIndex === 1) {
        return [[{ phone: '0901', date_of_birth: '2006-01-01', gender: 'MALE', province: 'HN', address: 'A' }], []] as any;
      }
      if (callIndex === 2) {
        return [[{ id: 5, graduation_year: 2024 }], []] as any;
      }
      if (callIndex === 3) {
        return [[{ subject_code: 'TOAN' }, { subject_code: 'VAN' }, { subject_code: 'LY' }, { subject_code: 'HOA' }], []] as any;
      }
      if (callIndex === 4) {
        return [[], []] as any;
      }
      if (callIndex === 5) {
        return [[{ school_name: 'THPT A' }], []] as any;
      }
      if (callIndex === 6) {
        return [[{ id: 88 }], []] as any;
      }
      return [[], []] as any;
    }) as any;

    const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
    const res = createMockResponse();
    requireCompleteProfile(req, res as any, () => resolve())
      .catch(reject);
  });

const testRequireCompleteProfileMissingEkyc = (): Promise<void> =>
  new Promise((resolve, reject) => {
    CandidateIdentityVerificationModel.isVerified = async () => false;
    let callIndex = 0;
    pool.execute = (async () => {
      callIndex += 1;
      if (callIndex === 1) {
        return [[{ phone: '0901', date_of_birth: '2006-01-01', gender: 'MALE', province: 'HN', address: 'A' }], []] as any;
      }
      if (callIndex === 2) {
        return [[{ id: 5, graduation_year: 2024 }], []] as any;
      }
      if (callIndex === 3) {
        return [[{ subject_code: 'TOAN' }, { subject_code: 'VAN' }, { subject_code: 'LY' }, { subject_code: 'HOA' }], []] as any;
      }
      if (callIndex === 4) {
        return [[], []] as any;
      }
      if (callIndex === 5) {
        return [[{ school_name: 'THPT A' }], []] as any;
      }
      if (callIndex === 6) {
        return [[{ id: 88 }], []] as any;
      }
      return [[], []] as any;
    }) as any;

    const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
    const res = createMockResponse();
    requireCompleteProfile(req, res as any, () => reject(new Error('next() should not be called')))
      .then(() => {
        try {
          assert.equal(res.statusCode, 400);
          assert.ok((res.body as any).missing_fields.includes('Xác thực CCCD/eKYC'));
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });

const run = async (): Promise<void> => {
  process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
  const tests: Array<[string, () => Promise<void>]> = [
    ['get profile success', testGetProfileSuccess],
    ['get profile not found', testGetProfileNotFound],
    ['update profile validation failed', testUpdateProfileValidationFail],
    ['update profile success', testUpdateProfileSuccess],
    ['get academic record success', testGetAcademicRecordSuccess],
    ['upsert academic record validation failed', testUpsertAcademicRecordValidationFail],
    ['upsert academic record success', testUpsertAcademicRecordSuccess],
    ['upsert academic progress success', testUpsertAcademicProgressSuccess],
    ['candidate upsert scores success with NGOAINGU + exam certificate', testCandidateUpsertGroupScoresNaturalSuccess],
    ['candidate upsert group scores invalid payload', testCandidateUpsertGroupScoresInvalidPayload],
    ['candidate upsert group scores missing exam certificate', testCandidateUpsertGroupScoresMissingCertificateFile],
    ['candidate upsert group scores candidate not found', testCandidateUpsertGroupScoresCandidateNotFound],
    ['candidate upsert group scores missing foreign_language when NGOAINGU', testCandidateUpsertGroupScoresMissingForeignLanguage],
    ['list documents success', testListDocumentsSuccess],
    ['upload document success', testUploadDocumentSuccess],
    ['delete document success', testDeleteDocumentSuccess],
    ['require complete profile missing exam certificate', testRequireCompleteProfileMissingExamCertificate],
    ['require complete profile with exam certificate', testRequireCompleteProfileWithExamCertificate],
    ['require complete profile missing eKYC', testRequireCompleteProfileMissingEkyc],
    ['auth middleware no token', testAuthMiddlewareNoToken],
    ['authorize wrong role', testAuthorizeWrongRole],
  ];

  for (const [name, fn] of tests) {
    await fn();
    console.log(`PASS: ${name}`);
  }
};

run()
  .then(() => {
    restore();
    console.log('All candidate profile tests passed');
  })
  .catch((error) => {
    restore();
    console.error('Candidate profile tests failed:', error);
    process.exit(1);
  });
