import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Misc Controllers Integration Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@nailssentialsqc.com',
        role: 'customer',
        clerk_id: 'clerk_testuser',
        customer_profile: {
          create: {
            full_name: 'Test User',
          },
        },
      },
    });
    authToken = 'clerk_testuser';
  });

  describe('Notifications', () => {
    it('should list notifications for the authenticated user', async () => {
      await prisma.notification.create({
        data: {
          user_id: testUser.id,
          type: 'INFO',
          title: 'Welcome',
          message: 'Hello!',
        },
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should mark a notification as read', async () => {
      const notification = await prisma.notification.create({
        data: {
          user_id: testUser.id,
          type: 'INFO',
          title: 'Mark Me',
          message: '...',
        },
      });

      const res = await request(app)
        .put(`/api/v1/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await prisma.notification.findUnique({ where: { id: notification.id } });
      expect(updated?.is_read).toBe(true);
    });
  });

  describe('Uploads', () => {
    it('should upload a sample image', async () => {
      // If the implementation strictly checks for a blob token in process.env,
      // we should either mock it or check if it's there.
      // Based on the code, it uses process.env.BLOB_READ_WRITE_TOKEN.

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.warn('Skipping upload integration test due to missing BLOB_READ_WRITE_TOKEN');
        return;
      }

      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake-image-data'), 'test.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBeDefined();
    });
  });
});
