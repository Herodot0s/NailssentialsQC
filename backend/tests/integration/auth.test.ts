import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Auth Integration Tests', () => {
  const getUniquePayload = () => {
    const randomId = Math.random().toString(36).substring(7);
    return {
      fullName: 'John Doe',
      email: `john_${randomId}@example.com`,
      password: 'Password123',
      phone: `123${Math.random().toString().slice(2, 10)}`,
    };
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const payload = getUniquePayload();
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(payload.email);
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should fail registration with weak password', async () => {
      const payload = getUniquePayload();
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...payload,
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with duplicate email', async () => {
      const payload = getUniquePayload();
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      // Try registering again with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...getUniquePayload(),
          email: payload.email,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let userPayload: any;
    beforeEach(async () => {
      userPayload = getUniquePayload();
      await request(app)
        .post('/api/v1/auth/register')
        .send(userPayload);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: userPayload.email,
          password: userPayload.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: userPayload.email,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Advanced Auth & Security', () => {
    let tokens: { accessToken: string; refreshToken: string };

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(getUniquePayload());
      tokens = response.body.data.tokens;
    });

    it('should refresh tokens and rotate refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      
      const newRefreshToken = response.body.data.tokens.refreshToken;
      expect(newRefreshToken).not.toBe(tokens.refreshToken);

      // Verify old refresh token is now invalid
      const reuseResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });
      
      expect(reuseResponse.status).toBe(403);
      expect(reuseResponse.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should invalidate refresh token on logout', async () => {
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: tokens.refreshToken });

      expect(logoutResponse.status).toBe(200);

      // Verify refresh token is now invalid
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });
      
      expect(refreshResponse.status).toBe(403);
    });

    it('should enforce RBAC: customer cannot access manager routes', async () => {
      // registerPayload user has 'customer' role by default
      const response = await request(app)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
