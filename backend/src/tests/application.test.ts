import assert from 'node:assert/strict';
import { submitApplication } from '../controllers/application.controller';
import { AdmissionCombinationModel } from '../models/admissionCombination.model';
import { ApplicationModel, type ApplicationWithDetails } from '../models/application.model';
import { CandidateProfileModel } from '../models/candidate-profile.model';
import { EmailNotificationModel, ApplicationStatusLogModel } from '../models/notification.model';
import { UserModel } from '../models/user.model';

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

const original = {
  findByIdWithDetails: ApplicationModel.findByIdWithDetails,
  hasSubmittedInCurrentPeriod: ApplicationModel.hasSubmittedInCurrentPeriod,
  submit: ApplicationModel.submit,
  getByUserId: CandidateProfileModel.getByUserId,
  getAcademicByUserId: CandidateProfileModel.getAcademicByUserId,
  findCombinationById: AdmissionCombinationModel.findById,
  createStatusLog: ApplicationStatusLogModel.create,
  createEmailNotification: EmailNotificationModel.create,
  findAdmins: UserModel.findByRole,
  startDate: process.env.APPLICATION_START_DATE,
  endDate: process.env.APPLICATION_END_DATE,
};

const restore = (): void => {
  ApplicationModel.findByIdWithDetails = original.findByIdWithDetails;
  ApplicationModel.hasSubmittedInCurrentPeriod = original.hasSubmittedInCurrentPeriod;
  ApplicationModel.submit = original.submit;
  CandidateProfileModel.getByUserId = original.getByUserId;
  CandidateProfileModel.getAcademicByUserId = original.getAcademicByUserId;
  AdmissionCombinationModel.findById = original.findCombinationById;
  ApplicationStatusLogModel.create = original.createStatusLog;
  EmailNotificationModel.create = original.createEmailNotification;
  UserModel.findByRole = original.findAdmins;
  if (original.startDate === undefined) {
    delete process.env.APPLICATION_START_DATE;
  } else {
    process.env.APPLICATION_START_DATE = original.startDate;
  }
  if (original.endDate === undefined) {
    delete process.env.APPLICATION_END_DATE;
  } else {
    process.env.APPLICATION_END_DATE = original.endDate;
  }
};

const baseApplication: ApplicationWithDetails = {
  id: 10,
  candidate_id: 1,
  application_code: 'APP-TEST',
  university_id: 'DH000001',
  major_id: 'NH000001',
  combination_id: 'TH000015',
  status: 'DRAFT',
  submitted_at: null,
  reviewed_by: null,
  reviewed_at: null,
  reject_reason: null,
  subject_1_score: null,
  subject_2_score: null,
  subject_3_score: null,
  created_at: new Date(),
  updated_at: new Date(),
  university_name: 'Dai hoc Test',
  university_code: 'DHT',
  major_name: 'Nganh Test',
  major_code: 'TEST',
  candidate_name: 'Nguyen Van A',
  candidate_email: 'candidate@example.com',
};

const baseProfile = {
  user_id: 1,
  citizen_id: 123456789012,
  full_name: 'Nguyen Van A',
};

const mockHappyPathInfrastructure = (): void => {
  process.env.APPLICATION_START_DATE = '01/01/2026';
  process.env.APPLICATION_END_DATE = '31/12/2026';
  ApplicationModel.findByIdWithDetails = async () => baseApplication;
  ApplicationModel.hasSubmittedInCurrentPeriod = async () => false;
  CandidateProfileModel.getByUserId = async () => baseProfile as any;
  AdmissionCombinationModel.findById = async () => ({
    id: 'TH000015',
    code: 'C01',
    subject_1: 'Toan',
    subject_2: 'Van',
    subject_3: 'Ly',
    created_at: new Date(),
  });
  ApplicationStatusLogModel.create = async () => ({ id: 1 } as any);
  EmailNotificationModel.create = async () => ({ id: 1 } as any);
  UserModel.findByRole = async () => [];
};

const createSubmitRequest = () => ({
  params: { application_id: '10' },
  user: { id: 1, email: 'candidate@example.com', role: 'CANDIDATE' },
  app: {
    get: () => ({
      to: () => ({
        emit: () => undefined,
      }),
    }),
  },
}) as any;

const testRejectsWhenExamSubjectsDoNotMatchCombination = async (): Promise<void> => {
  mockHappyPathInfrastructure();
  let submitCalled = false;
  CandidateProfileModel.getAcademicByUserId = async () => ({
    academic_record: {
      id: 1,
      candidate_id: 123456789012,
      graduation_year: 2026,
      priority_score: 0,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', is_required: true, score: 8 },
        { subject_code: 'VAN', subject_name: 'Van', is_required: true, score: 8 },
        { subject_code: 'HOA', subject_name: 'Hoa', is_required: false, score: 8 },
        { subject_code: 'NGOAINGU', subject_name: 'Ngoai ngu', is_required: false, score: 8 },
      ],
      foreign_language: { language_code: 'ANH', language_name: 'Tieng Anh' },
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });
  ApplicationModel.submit = async () => {
    submitCalled = true;
    return { ...baseApplication, status: 'SUBMITTED', submitted_at: new Date() };
  };

  const res = createMockResponse();
  await submitApplication(createSubmitRequest(), res as any);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Môn thi đã khai báo không khớp với tổ hợp xét tuyển đã chọn');
  assert.deepEqual(res.body.missing_subjects, ['LY']);
  assert.deepEqual(res.body.required_subjects, ['TOAN', 'VAN', 'LY']);
  assert.equal(submitCalled, false);
};

const testSubmitsWhenExamSubjectsMatchCombination = async (): Promise<void> => {
  mockHappyPathInfrastructure();
  CandidateProfileModel.getAcademicByUserId = async () => ({
    academic_record: {
      id: 1,
      candidate_id: 123456789012,
      graduation_year: 2026,
      priority_score: 0,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', is_required: true, score: 8 },
        { subject_code: 'VAN', subject_name: 'Van', is_required: true, score: 8 },
        { subject_code: 'LY', subject_name: 'Ly', is_required: false, score: 8 },
        { subject_code: 'HOA', subject_name: 'Hoa', is_required: false, score: 8 },
      ],
      foreign_language: null,
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });
  ApplicationModel.submit = async () => ({ ...baseApplication, status: 'SUBMITTED', submitted_at: new Date() });

  const res = createMockResponse();
  await submitApplication(createSubmitRequest(), res as any);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
};

const testMapsEnglishCombinationSubjectToForeignLanguageScore = async (): Promise<void> => {
  mockHappyPathInfrastructure();
  AdmissionCombinationModel.findById = async () => ({
    id: 'TH000028',
    code: 'D01',
    subject_1: 'Van',
    subject_2: 'Toan',
    subject_3: 'Anh',
    created_at: new Date(),
  });
  CandidateProfileModel.getAcademicByUserId = async () => ({
    academic_record: {
      id: 1,
      candidate_id: 123456789012,
      graduation_year: 2026,
      priority_score: 0,
      exam_scores: [
        { subject_code: 'TOAN', subject_name: 'Toan', is_required: true, score: 8 },
        { subject_code: 'VAN', subject_name: 'Van', is_required: true, score: 8 },
        { subject_code: 'NGOAINGU', subject_name: 'Ngoai ngu', is_required: false, score: 8 },
        { subject_code: 'HOA', subject_name: 'Hoa', is_required: false, score: 8 },
      ],
      foreign_language: { language_code: 'ANH', language_name: 'Tieng Anh' },
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });
  ApplicationModel.submit = async () => ({ ...baseApplication, status: 'SUBMITTED', submitted_at: new Date() });

  const res = createMockResponse();
  await submitApplication(createSubmitRequest(), res as any);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
};

const testRejectsWhenAcademicRecordIsMissing = async (): Promise<void> => {
  mockHappyPathInfrastructure();
  let submitCalled = false;
  CandidateProfileModel.getAcademicByUserId = async () => null;
  ApplicationModel.submit = async () => {
    submitCalled = true;
    return { ...baseApplication, status: 'SUBMITTED', submitted_at: new Date() };
  };

  const res = createMockResponse();
  await submitApplication(createSubmitRequest(), res as any);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Môn thi đã khai báo không khớp với tổ hợp xét tuyển đã chọn');
  assert.equal(submitCalled, false);
};

const testRejectsWhenExamScoresAreEmpty = async (): Promise<void> => {
  mockHappyPathInfrastructure();
  let submitCalled = false;
  CandidateProfileModel.getAcademicByUserId = async () => ({
    academic_record: {
      id: 1,
      candidate_id: 123456789012,
      graduation_year: 2026,
      priority_score: 0,
      exam_scores: [],
      foreign_language: null,
    },
    academic_progress: { grade_10: {}, grade_11: {}, grade_12: {} },
  });
  ApplicationModel.submit = async () => {
    submitCalled = true;
    return { ...baseApplication, status: 'SUBMITTED', submitted_at: new Date() };
  };

  const res = createMockResponse();
  await submitApplication(createSubmitRequest(), res as any);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.deepEqual(res.body.missing_subjects, ['TOAN', 'VAN', 'LY']);
  assert.equal(submitCalled, false);
};

const run = async (): Promise<void> => {
  const tests: Array<[string, () => Promise<void>]> = [
    ['rejects submit when exam subjects do not match combination', testRejectsWhenExamSubjectsDoNotMatchCombination],
    ['submits when exam subjects match combination', testSubmitsWhenExamSubjectsMatchCombination],
    ['maps Anh combination subject to NGOAINGU score', testMapsEnglishCombinationSubjectToForeignLanguageScore],
    ['rejects submit when academic record is missing', testRejectsWhenAcademicRecordIsMissing],
    ['rejects submit when exam scores are empty', testRejectsWhenExamScoresAreEmpty],
  ];

  for (const [name, test] of tests) {
    try {
      await test();
      console.log(`PASS ${name}`);
    } finally {
      restore();
    }
  }
};

run()
  .then(() => {
    console.log('All application tests passed');
  })
  .catch((error) => {
    console.error('Application tests failed:', error);
    restore();
    process.exit(1);
  });
