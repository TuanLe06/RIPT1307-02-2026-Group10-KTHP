import assert from 'node:assert/strict';
import {
  candidateDocumentDeps,
  deleteCandidateDocument,
  getCandidateAcademicRecord,
  listCandidateDocuments,
  getCandidateProfile,
  uploadCandidateDocument,
  upsertCandidateExamScoresByGroupAsAdmin,
  upsertCandidateAcademicProgress,
  upsertCandidateAcademicRecord,
  updateCandidateProfile,
} from '../controllers/candidate-profile.controller';
import { CandidateProfileModel } from '../models/candidate-profile.model';
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
  upsertExamScoresByGroupForCandidateByCitizenId: CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId,
  listDocumentsByUserId: CandidateProfileModel.listDocumentsByUserId,
  createDocumentByUserId: CandidateProfileModel.createDocumentByUserId,
  findDocumentByUserId: CandidateProfileModel.findDocumentByUserId,
  softDeleteDocumentByUserId: CandidateProfileModel.softDeleteDocumentByUserId,
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
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId =
    original.upsertExamScoresByGroupForCandidateByCitizenId;
  CandidateProfileModel.listDocumentsByUserId = original.listDocumentsByUserId;
  CandidateProfileModel.createDocumentByUserId = original.createDocumentByUserId;
  CandidateProfileModel.findDocumentByUserId = original.findDocumentByUserId;
  CandidateProfileModel.softDeleteDocumentByUserId = original.softDeleteDocumentByUserId;
  candidateDocumentDeps.uploadDocumentBuffer = original.uploadDocumentBuffer;
  candidateDocumentDeps.deleteAssetByPublicId = original.deleteAssetByPublicId;
};

const sampleFlatProfile = {
  user_id: 1,
  email: 'candidate@example.com',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  last_login_at: null,
  citizen_id: 123456789012,
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
      citizen_id: 123456789012,
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
      science_group: 'NATURAL',
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'ANH', subject_name: 'Tieng Anh', score: 8.0 },
        { subject_code: 'SINH', subject_name: 'Sinh hoc', score: 8.5 },
        { subject_code: 'TOAN', subject_name: 'Toan', score: 8.5 },
        { subject_code: 'VAN', subject_name: 'Ngu van', score: 8.25 },
        { subject_code: 'LY', subject_name: 'Vat ly', score: 8.25 },
        { subject_code: 'HOA', subject_name: 'Hoa hoc', score: 9 },
      ],
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
    body: { science_group: 'INVALID' },
    'express-validator#contexts': [{ errors: [{ msg: 'science_group is invalid' }] }],
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
      science_group: 'NATURAL',
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', score: 8.5 },
        { subject_code: 'LY', subject_name: 'Vat ly', score: 8.25 },
        { subject_code: 'HOA', subject_name: 'Hoa hoc', score: 9 },
      ],
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });

  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: {
      graduation_year: 2024,
      science_group: 'NATURAL',
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
      science_group: 'NATURAL',
      priority_score: 0,
      exam_scores: [],
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

const testAdminUpsertGroupScoresNaturalSuccess = async (): Promise<void> => {
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      science_group: 'NATURAL',
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', score: 8.5 },
        { subject_code: 'LY', subject_name: 'Vat ly', score: 8.25 },
        { subject_code: 'HOA', subject_name: 'Hoa hoc', score: 9 },
      ],
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });

  const req = {
    user: { id: 10, role: 'ADMIN' },
    params: { citizenId: '123456789012' },
    body: { science_group: 'NATURAL', scores: { TOAN: 8.5, VAN: 8.25, ANH: 8.0, LY: 8.25, HOA: 9, SINH: 8.5 } },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroupAsAdmin(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testAdminUpsertGroupScoresSocialSuccess = async (): Promise<void> => {
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId = async () => ({
    academic_record: {
      id: 5,
      candidate_id: 123456789012,
      graduation_year: 2024,
      science_group: 'SOCIAL',
      priority_score: 1.5,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', score: 8.0 },
        { subject_code: 'ANH', subject_name: 'Tieng Anh', score: 7.25 },
        { subject_code: 'VAN', subject_name: 'Ngu van', score: 8.5 },
        { subject_code: 'SU', subject_name: 'Lich su', score: 8.25 },
        { subject_code: 'DIA', subject_name: 'Dia ly', score: 9 },
        { subject_code: 'GDCD', subject_name: 'GDCD', score: 8.0 },
      ],
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });

  const req = {
    user: { id: 10, role: 'ADMIN' },
    params: { citizenId: '123456789012' },
    body: { science_group: 'SOCIAL', scores: { TOAN: 8.0, VAN: 8.5, ANH: 7.25, SU: 8.25, DIA: 9, GDCD: 8.0 } },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroupAsAdmin(req, res as any);
  assert.equal(res.statusCode, 200);
};

const testAdminUpsertGroupScoresInvalidPayload = async (): Promise<void> => {
  const req = {
    user: { id: 10, role: 'ADMIN' },
    params: { citizenId: '123456789012' },
    body: { science_group: 'INVALID' },
    'express-validator#contexts': [{ errors: [{ msg: 'science_group is invalid' }] }],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroupAsAdmin(req, res as any);
  assert.equal(res.statusCode, 400);
};

const testAdminUpsertGroupScoresCandidateNotFound = async (): Promise<void> => {
  CandidateProfileModel.upsertExamScoresByGroupForCandidateByCitizenId = async () => null;
  const req = {
    user: { id: 10, role: 'ADMIN' },
    params: { citizenId: '999999999999' },
    body: { science_group: 'NATURAL', scores: { TOAN: 8.5, VAN: 8.25, ANH: 8.0, LY: 8.25, HOA: 9, SINH: 8.5 } },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await upsertCandidateExamScoresByGroupAsAdmin(req, res as any);
  assert.equal(res.statusCode, 404);
};

const testListDocumentsSuccess = async (): Promise<void> => {
  CandidateProfileModel.listDocumentsByUserId = async () => [
    {
      id: 1,
      document_type: 'TRANSCRIPT',
      file_name: 'doc1',
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
    document_type: 'TRANSCRIPT',
    file_name: 'folder/doc1',
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/doc1.pdf',
    file_type: 'PDF',
    file_size: 12345,
    uploaded_at: new Date(),
  });
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_type: 'TRANSCRIPT' },
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
};

const testDeleteDocumentSuccess = async (): Promise<void> => {
  CandidateProfileModel.findDocumentByUserId = async () => ({
    id: 1,
    candidate_id: 123456789012,
    document_type: 'TRANSCRIPT',
    file_name: 'folder/doc1',
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/folder/doc1.pdf',
    file_type: 'PDF',
    file_size: 12345,
    uploaded_at: new Date(),
    deleted_at: null,
  });
  candidateDocumentDeps.deleteAssetByPublicId = async () => undefined;
  CandidateProfileModel.softDeleteDocumentByUserId = async () => true;
  const req = { user: { id: 1, role: 'CANDIDATE' }, params: { documentId: '1' } } as any;
  const res = createMockResponse();
  await deleteCandidateDocument(req, res as any);
  assert.equal(res.statusCode, 200);
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
    ['admin upsert NATURAL group scores success', testAdminUpsertGroupScoresNaturalSuccess],
    ['admin upsert SOCIAL group scores success', testAdminUpsertGroupScoresSocialSuccess],
    ['admin upsert group scores invalid payload', testAdminUpsertGroupScoresInvalidPayload],
    ['admin upsert group scores candidate not found', testAdminUpsertGroupScoresCandidateNotFound],
    ['list documents success', testListDocumentsSuccess],
    ['upload document success', testUploadDocumentSuccess],
    ['delete document success', testDeleteDocumentSuccess],
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
