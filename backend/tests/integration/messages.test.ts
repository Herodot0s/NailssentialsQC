import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Messages Integration Tests', () => {
  let senderToken: string;
  let receiverToken: string;
  let senderUser: any;
  let receiverUser: any;

  beforeAll(async () => {
    // Create sender user
    senderUser = await prisma.user.create({
      data: {
        username: 'sendermsg',
        email: 'sender@nailssentialsqc.com',
        role: 'customer',
        clerk_id: 'clerk_sendermsg',
        customer_profile: {
          create: {
            full_name: 'Sender User',
          },
        },
      },
    });
    senderToken = 'clerk_sendermsg';

    // Create receiver user
    receiverUser = await prisma.user.create({
      data: {
        username: 'receivermsg',
        email: 'receiver@nailssentialsqc.com',
        role: 'staff',
        clerk_id: 'clerk_receivermsg',
        staff_profile: {
          create: {
            full_name: 'Receiver Staff',
          },
        },
      },
    });
    receiverToken = 'clerk_receivermsg';
  });

  describe('POST /api/v1/messages', () => {
    it('should successfully send a message from sender to receiver', async () => {
      const payload = {
        receiverId: receiverUser.id.toString(),
        subject: 'Appointment Confirmation Request',
        body: 'Hello, is my appointment confirmed?',
      };

      const res = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.sender_id).toBe(senderUser.id);
      expect(res.body.data.receiver_id).toBe(receiverUser.id);
      expect(res.body.data.subject).toBe(payload.subject);
      expect(res.body.data.body).toBe(payload.body);
      expect(res.body.data.is_read).toBe(false);
    });

    it('should return 400 when missing required fields', async () => {
      const payload = {
        receiverId: '',
        subject: 'Missing Fields',
        body: '',
      };

      const res = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('should return 401 when auth token is missing', async () => {
      const payload = {
        receiverId: receiverUser.id.toString(),
        subject: 'No Auth',
        body: 'No auth token set',
      };

      const res = await request(app)
        .post('/api/v1/messages')
        .send(payload);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/messages', () => {
    it('should fetch all messages related to the logged-in user', async () => {
      const res = await request(app)
        .get('/api/v1/messages')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const message = res.body.data[0];
      expect(message.sender).toBeDefined();
      expect(message.receiver).toBeDefined();
      expect(message.sender.id).toBe(senderUser.id);
      expect(message.receiver.id).toBe(receiverUser.id);
    });
  });

  describe('PATCH /api/v1/messages/:id/read', () => {
    it('should successfully mark the message as read', async () => {
      // Fetch messages for the receiver to get the message ID
      const listRes = await request(app)
        .get('/api/v1/messages')
        .set('Authorization', `Bearer ${receiverToken}`);

      const messageId = listRes.body.data[0].id;

      const res = await request(app)
        .patch(`/api/v1/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_read).toBe(true);

      // Verify in DB
      const dbMessage = await prisma.message.findUnique({
        where: { id: messageId },
      });
      expect(dbMessage?.is_read).toBe(true);
    });

    it('should return 500 when marking as read for a message received by someone else', async () => {
      // Fetch messages for the sender (who sent it, not received it)
      const listRes = await request(app)
        .get('/api/v1/messages')
        .set('Authorization', `Bearer ${senderToken}`);

      const messageId = listRes.body.data[0].id;

      // Sender attempts to mark message as read (fails check: receiver_id: userId)
      const res = await request(app)
        .patch(`/api/v1/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
