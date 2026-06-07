import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { register, login, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { UserModel } from '../models/user.model';

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

const originalMethods = {
  existsByEmail: UserModel.existsByEmail,
  existsCandidateByCitizenId: UserModel.existsCandidateByCitizenId,
  createCandidateWithProfile: UserModel.createCandidateWithProfile,
  findAuthByEmail: UserModel.findAuthByEmail,
  touchLastLoginAt: UserModel.touchLastLoginAt,
  findById: UserModel.findById,
};

const restoreUserModel = (): void => {
  UserModel.existsByEmail = originalMethods.existsByEmail;
  UserModel.existsCandidateByCitizenId = originalMethods.existsCandidateByCitizenId;
  UserModel.createCandidateWithProfile = originalMethods.createCandidateWithProfile;
  UserModel.findAuthByEmail = originalMethods.findAuthByEmail;
  UserModel.touchLastLoginAt = originalMethods.touchLastLoginAt;
  UserModel.findById = originalMethods.findById;
};

const testRegisterSuccess = async (): Promise<void> => {
  UserModel.existsByEmail = async () => false;
  UserModel.existsCandidateByCitizenId = async () => false;
  UserModel.createCandidateWithProfile = async () => ({
    id: 1,
    email: 'a@b.com',
    full_name: 'Nguyen Van A',
    password_hash: 'hash',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    avatar_url: null,
    avatar_public_id: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const req = {
    body: {
      citizen_id: '123456789012',
      full_name: 'Nguyen Van A',
      email: 'a@b.com',
      password: 'secret123',
    },
  } as any;
  const res = createMockResponse();

  await register(req, res as any);
  assert.equal(res.statusCode, 201);
  assert.equal((res.body as any)?.data?.full_name, 'Nguyen Van A');
};

const testRegisterDuplicateEmail = async (): Promise<void> => {
  UserModel.existsByEmail = async () => true;

  const req = {
    body: { citizen_id: '123456789012', full_name: 'A', email: 'a@b.com', password: 'secret123' },
  } as any;
  const res = createMockResponse();

  await register(req, res as any);
  assert.equal(res.statusCode, 409);
};

const testRegisterDuplicateCitizen = async (): Promise<void> => {
  UserModel.existsByEmail = async () => false;
  UserModel.existsCandidateByCitizenId = async () => true;

  const req = {
    body: { citizen_id: '123456789012', full_name: 'A', email: 'a@b.com', password: 'secret123' },
  } as any;
  const res = createMockResponse();

  await register(req, res as any);
  assert.equal(res.statusCode, 409);
};

const testLoginInvalidCredential = async (): Promise<void> => {
  UserModel.findAuthByEmail = async () => null;
  const req = { body: { email: 'x@y.com', password: 'wrong' } } as any;
  const res = createMockResponse();

  await login(req, res as any);
  assert.equal(res.statusCode, 401);
};

const testLoginLockedAccount = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash('secret123', 4);
  UserModel.findAuthByEmail = async () => ({
    id: 1,
    email: 'lock@x.com',
    password_hash: passwordHash,
    full_name: 'Lock User',
    role: 'CANDIDATE',
    status: 'LOCKED',
    avatar_url: null,
    avatar_public_id: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const req = { body: { email: 'lock@x.com', password: 'secret123' } } as any;
  const res = createMockResponse();

  await login(req, res as any);
  assert.equal(res.statusCode, 403);
};

const testLogoutSuccess = async (): Promise<void> => {
  const req = {} as any;
  const res = createMockResponse();
  await logout(req, res as any);
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

const testAuthMiddlewareInvalidToken = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = { headers: { authorization: 'Bearer invalid' } } as any;
    const res = createMockResponse();
    authenticate(req, res as any, () => reject(new Error('next() should not be called')));
    try {
      assert.equal(res.statusCode, 401);
      resolve();
    } catch (error) {
      reject(error);
    }
  });

const run = async (): Promise<void> => {
  process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
  process.env.JWT_EXPIRES_IN = '7d';

  const tests: Array<[string, () => Promise<void>]> = [
    ['register success', testRegisterSuccess],
    ['register duplicate email', testRegisterDuplicateEmail],
    ['register duplicate citizen id', testRegisterDuplicateCitizen],
    ['login invalid credentials', testLoginInvalidCredential],
    ['login locked account', testLoginLockedAccount],
    ['logout success', testLogoutSuccess],
    ['auth middleware no token', testAuthMiddlewareNoToken],
    ['auth middleware invalid token', testAuthMiddlewareInvalidToken],
  ];

  for (const [name, testFn] of tests) {
    await testFn();
    console.log(`PASS: ${name}`);
  }
};

run()
  .then(() => {
    restoreUserModel();
    console.log('All auth tests passed');
  })
  .catch((error) => {
    restoreUserModel();
    console.error('Auth tests failed:', error);
    process.exit(1);
  });
