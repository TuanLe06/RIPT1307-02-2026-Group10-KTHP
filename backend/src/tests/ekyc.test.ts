import assert from 'node:assert/strict';
import {
  CandidateIdentityVerificationModel,
  type EkycStatusSummary,
} from '../models/candidate-identity-verification.model';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import { EkycError, EkycService, ekycDeps } from '../services/ekyc.service';
import {
  getCandidateEkycStatus,
  verifyCandidateCitizenIdBack,
  verifyCandidateCitizenIdFront,
  verifyCandidatePortrait,
} from '../controllers/ekyc.controller';

type MockResponse = {
  statusCode: number;
  body: any;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
};

const createMockResponse = (): MockResponse => ({
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
});

const baseStatus: EkycStatusSummary = {
  id: 1,
  user_id: 1,
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

const frontDocument = {
  id: 10,
  candidate_id: 123456789012,
  document_type: 'CITIZEN_ID_Front' as const,
  file_name: 'front.jpg',
  display_name: null,
  file_url: 'https://example.com/front.jpg',
  file_type: 'JPEG' as const,
  file_size: 10,
  uploaded_at: new Date(),
  deleted_at: null,
};

const backDocument = {
  ...frontDocument,
  id: 11,
  document_type: 'CITIZEN_ID_Back' as const,
  file_name: 'back.jpg',
};

const portraitDocument = {
  ...frontDocument,
  id: 12,
  document_type: 'PORTRAIT' as const,
  file_name: 'portrait.jpg',
};

const original = {
  getByUserId: CandidateProfileModel.getByUserId,
  getOrDefaultByUserId: CandidateIdentityVerificationModel.getOrDefaultByUserId,
  getByVerificationUserId: CandidateIdentityVerificationModel.getByUserId,
  upsertByUserId: CandidateIdentityVerificationModel.upsertByUserId,
  assertActiveDocumentForUser: CandidateIdentityVerificationModel.assertActiveDocumentForUser,
  isVerified: CandidateIdentityVerificationModel.isVerified,
  provider: ekycDeps.provider,
};

const restore = (): void => {
  CandidateProfileModel.getByUserId = original.getByUserId;
  CandidateIdentityVerificationModel.getOrDefaultByUserId = original.getOrDefaultByUserId;
  CandidateIdentityVerificationModel.getByUserId = original.getByVerificationUserId;
  CandidateIdentityVerificationModel.upsertByUserId = original.upsertByUserId;
  CandidateIdentityVerificationModel.assertActiveDocumentForUser = original.assertActiveDocumentForUser;
  CandidateIdentityVerificationModel.isVerified = original.isVerified;
  ekycDeps.provider = original.provider;
};

const mockCommonModel = (): void => {
   CandidateProfileModel.getByUserId = async () => ({
     user_id: 1,
     email: 'candidate@example.com',
     role: 'CANDIDATE',
     status: 'ACTIVE',
     last_login_at: null,
     citizen_id: '123456789012',
     full_name: 'Candidate',
     phone: '0901',
     date_of_birth: null,
     gender: null,
     citizen_issue_date: null,
     citizen_issue_place: null,
     religion: null,
     ethnic: null,
     nation: null,
     province: null,
     ward: null,
     address: null,
   });
  CandidateIdentityVerificationModel.getOrDefaultByUserId = async () => ({ ...baseStatus });
  CandidateIdentityVerificationModel.getByUserId = async () => ({ ...baseStatus });
  CandidateIdentityVerificationModel.upsertByUserId = async (userId, data) => ({
    ...baseStatus,
    user_id: userId,
    ...data,
  });
  CandidateIdentityVerificationModel.assertActiveDocumentForUser = async (_userId, documentId, expectedType) => {
    if (documentId === 99) {
      const error = new Error('Document not found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    const byType = {
      CITIZEN_ID_Front: frontDocument,
      CITIZEN_ID_Back: backDocument,
      PORTRAIT: portraitDocument,
    };
    return byType[expectedType] as any;
  };
};

const testStatusDefault = async (): Promise<void> => {
  CandidateIdentityVerificationModel.getOrDefaultByUserId = async () => ({ ...baseStatus });
  const req = { user: { id: 1, role: 'CANDIDATE' } } as any;
  const res = createMockResponse();
  await getCandidateEkycStatus(req, res as any);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.overall_status, 'UNVERIFIED');
};

const testFrontSuccess = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' }),
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.front_status, 'VERIFIED');
};

const testFrontSuccessWithFptCcFrontAndPaddedCitizenId = async (): Promise<void> => {
   mockCommonModel();
   CandidateProfileModel.getByUserId = async () => ({
     user_id: 1,
     email: 'candidate@example.com',
     role: 'CANDIDATE',
     status: 'ACTIVE',
     last_login_at: null,
     citizen_id: '1206001154',
     full_name: 'Candidate',
     phone: '0901',
     date_of_birth: null,
     gender: null,
     citizen_issue_date: null,
     citizen_issue_place: null,
     religion: null,
     ethnic: null,
     nation: null,
     province: null,
    ward: null,
    address: null,
  });
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cc_front', citizenId: '001206001154' }),
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.front_status, 'VERIFIED');
};

const testFrontCitizenMismatch = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cccd_12_front', citizenId: '999999999999' }),
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const status = await EkycService.verifyFront(1, 10);
  assert.equal(status.front_status, 'FAILED');
  assert.equal(status.overall_status, 'FAILED');
};

const testWrongDocumentRejectedBeforeProvider = async (): Promise<void> => {
  let providerCalled = false;
  CandidateIdentityVerificationModel.assertActiveDocumentForUser = async () => {
    const error = new Error('Document type must be CITIZEN_ID_Front') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  };
  ekycDeps.provider = {
    verifyIdDocument: async () => {
      providerCalled = true;
      return { errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' };
    },
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 400);
  assert.equal(providerCalled, false);
};

const testMissingDocumentReturnsNotFound = async (): Promise<void> => {
  mockCommonModel();
  let providerCalled = false;
  ekycDeps.provider = {
    verifyIdDocument: async () => {
      providerCalled = true;
      return { errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' };
    },
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 99 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 404);
  assert.equal(providerCalled, false);
};

const testSoftDeletedDocumentReturnsNotFound = async (): Promise<void> => {
  CandidateIdentityVerificationModel.assertActiveDocumentForUser = async () => {
    const error = new Error('Document not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  };
  let providerCalled = false;
  ekycDeps.provider = {
    verifyIdDocument: async () => {
      providerCalled = true;
      return { errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' };
    },
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 404);
  assert.equal(providerCalled, false);
};

const testFrontWrongSide = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'new_back', citizenId: '123456789012' }),
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.data.front_status, 'FAILED');
};

const testBackWrongSide = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cccd_12_front', citizenId: null }),
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 11 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdBack(req, res as any);
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.data.back_status, 'FAILED');
};

const testProviderTimeoutIsSanitized = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => {
      throw new EkycError(503, 'EKYC_PROVIDER_TIMEOUT', 'raw timeout details');
    },
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.message, 'eKYC provider timeout');
  assert.equal(JSON.stringify(res.body).includes('raw timeout details'), false);
};

const testProviderRateLimitIsSanitized = async (): Promise<void> => {
  mockCommonModel();
  ekycDeps.provider = {
    verifyIdDocument: async () => {
      throw new EkycError(502, 'EKYC_PROVIDER_ERROR', 'raw rate limit body with provider data');
    },
    compareFaces: async () => ({ isMatch: true, similarity: 90 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { document_id: 10 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidateCitizenIdFront(req, res as any);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.message, 'eKYC provider error');
  assert.equal(JSON.stringify(res.body).includes('raw rate limit body'), false);
};

const testFaceMismatch = async (): Promise<void> => {
  mockCommonModel();
  CandidateIdentityVerificationModel.getOrDefaultByUserId = async () => ({
    ...baseStatus,
    front_document_id: 10,
    front_status: 'VERIFIED',
    back_document_id: 11,
    back_status: 'VERIFIED',
    overall_status: 'PARTIAL',
  });
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' }),
    compareFaces: async () => ({ isMatch: false, similarity: 60 }),
  };
  const req = {
    user: { id: 1, role: 'CANDIDATE' },
    body: { front_document_id: 10, portrait_document_id: 12 },
    'express-validator#contexts': [],
  } as any;
  const res = createMockResponse();
  await verifyCandidatePortrait(req, res as any);
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.data.face_status, 'FAILED');
};

const testFullSuccess = async (): Promise<void> => {
  mockCommonModel();
  CandidateIdentityVerificationModel.getOrDefaultByUserId = async () => ({
    ...baseStatus,
    front_document_id: 10,
    back_document_id: 11,
    front_status: 'VERIFIED',
    back_status: 'VERIFIED',
    overall_status: 'PARTIAL',
  });
  ekycDeps.provider = {
    verifyIdDocument: async () => ({ errorCode: 0, typeNew: 'cccd_12_front', citizenId: '123456789012' }),
    compareFaces: async () => ({ isMatch: true, similarity: 92 }),
  };
  const status = await EkycService.verifyFace(1, 10, 12);
  assert.equal(status.face_status, 'VERIFIED');
  assert.equal(status.overall_status, 'VERIFIED');
};

const run = async (): Promise<void> => {
  const tests: Array<[string, () => Promise<void>]> = [
    ['status default is unverified', testStatusDefault],
    ['front verify success', testFrontSuccess],
    ['front verify accepts FPT cc_front and padded citizen id', testFrontSuccessWithFptCcFrontAndPaddedCitizenId],
    ['front citizen id mismatch fails', testFrontCitizenMismatch],
    ['wrong document rejected before provider', testWrongDocumentRejectedBeforeProvider],
    ['missing document returns not found before provider', testMissingDocumentReturnsNotFound],
    ['soft deleted document returns not found before provider', testSoftDeletedDocumentReturnsNotFound],
    ['front wrong side fails', testFrontWrongSide],
    ['back wrong side fails', testBackWrongSide],
    ['provider timeout is sanitized', testProviderTimeoutIsSanitized],
    ['provider rate limit is sanitized', testProviderRateLimitIsSanitized],
    ['face mismatch fails', testFaceMismatch],
    ['full success marks verified', testFullSuccess],
  ];

  for (const [name, fn] of tests) {
    await fn();
    restore();
    console.log(`PASS: ${name}`);
  }
};

run()
  .then(() => {
    restore();
    console.log('All eKYC tests passed');
  })
  .catch((error) => {
    restore();
    console.error('eKYC tests failed:', error);
    process.exit(1);
  });
