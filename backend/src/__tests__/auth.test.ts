import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';

// Mocking Clerk as it's the external auth provider
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
      updateUserMetadata: jest.fn(),
    },
  },
  clerkMiddleware: () => (req: any, res: any, next: any) => next(),
}));

import { getAuth, clerkClient } from '@clerk/express';

// Mocking Svix Webhook verification
jest.mock('svix', () => {
  return {
    Webhook: jest.fn().mockImplementation(() => ({
      verify: jest.fn().mockImplementation((payload) => JSON.parse(payload)),
    })),
  };
});

describe('User Registration (Clerk Sync via Webhooks)', () => {
  const WEBHOOK_SECRET = 'test_secret';

  beforeAll(() => {
    process.env.CLERK_WEBHOOK_SECRET = WEBHOOK_SECRET;
    // Ensure test environment uses a separate DB or we clean it up
  });

  beforeEach(async () => {
    // Clear relevant tables if needed or use transaction mocks
    // For integration tests against a real test DB:
    await prisma.customerProfile.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.user.deleteMany();
    jest.clearAllMocks();
  });

  const createClerkWebhookPayload = (data: any, type: string = 'user.created') => {
    return {
      data: {
        id: data.id || 'user_123',
        email_addresses: [
          {
            id: 'email_123',
            email_address: data.email || 'test@example.com',
          },
        ],
        primary_email_address_id: 'email_123',
        first_name: data.firstName || 'John',
        last_name: data.lastName || 'Doe',
        public_metadata: data.public_metadata || {},
      },
      type,
    };
  };

  const getSvixHeaders = () => ({
    'svix-id': 'msg_123',
    'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
    'svix-signature': 'v1,test_signature',
  });

  describe('POST /api/v1/auth/webhooks/clerk', () => {
    it('should successfully register a new customer via webhook', async () => {
      const userData = {
        id: 'clerk_cust_1',
        email: 'customer@example.com',
        firstName: 'Test',
        lastName: 'Customer',
      };
      const payload = createClerkWebhookPayload(userData);

      const response = await request(app)
        .post('/api/v1/auth/webhooks/clerk')
        .set(getSvixHeaders())
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user in DB
      const user = await prisma.user.findUnique({
        where: { clerk_id: userData.id },
        include: { customer_profile: true },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);
      expect(user?.role).toBe('customer');
      expect(user?.customer_profile?.full_name).toBe('Test Customer');
    });

    it('should successfully register a new staff member via webhook', async () => {
      const userData = {
        id: 'clerk_staff_1',
        email: 'staff@example.com',
        firstName: 'Staff',
        lastName: 'Member',
        public_metadata: { role: 'staff' },
      };
      const payload = createClerkWebhookPayload(userData);

      const response = await request(app)
        .post('/api/v1/auth/webhooks/clerk')
        .set(getSvixHeaders())
        .send(payload);

      expect(response.status).toBe(200);

      // Verify user in DB
      const user = await prisma.user.findUnique({
        where: { clerk_id: userData.id },
        include: { staff_profile: true },
      });

      expect(user).toBeDefined();
      expect(user?.role).toBe('staff');
      expect(user?.staff_profile?.full_name).toBe('Staff Member');
    });

    it('should handle duplicate email by throwing error or handling upsert gracefully', async () => {
      // Create a user with an email
      await prisma.user.create({
        data: {
          username: 'existing@example.com',
          email: 'existing@example.com',
          role: 'customer',
          clerk_id: 'clerk_old_1'
        }
      });

      const userData = {
        id: 'clerk_new_1',
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'ClerkId',
      };
      const payload = createClerkWebhookPayload(userData);

      const response = await request(app)
        .post('/api/v1/auth/webhooks/clerk')
        .set(getSvixHeaders())
        .send(payload);

      // If the email is unique in DB, and we try to upsert a new clerk_id with same email,
      // Prisma will throw an error if the controller doesn't handle it.
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should fail if svix headers are missing', async () => {
      const payload = createClerkWebhookPayload({});
      const response = await request(app)
        .post('/api/v1/auth/webhooks/clerk')
        .send(payload);

      expect(response.status).toBe(400);
    });
  });

  describe('Registration via authenticateToken (Just-in-Time Sync)', () => {
    it('should create a local user if authenticated in Clerk but missing in local DB', async () => {
      const clerkId = 'clerk_jit_123';
      const email = 'jit@example.com';

      // Mock Clerk getAuth and users.getUser
      (getAuth as jest.Mock).mockReturnValue({ userId: clerkId });
      (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
        id: clerkId,
        firstName: 'JIT',
        lastName: 'User',
        emailAddresses: [{ id: 'email_1', emailAddress: email, verification: { status: 'verified' } }],
        primaryEmailAddressId: 'email_1',
        publicMetadata: { role: 'customer' },
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);

      // Verify DB
      const user = await prisma.user.findUnique({
        where: { clerk_id: clerkId }
      });
      expect(user).toBeDefined();
    });

    it('should return 401 if no Clerk session is found', async () => {
      (getAuth as jest.Mock).mockReturnValue({ userId: null });

      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('TOKEN_REQUIRED');
    });
  });
});
