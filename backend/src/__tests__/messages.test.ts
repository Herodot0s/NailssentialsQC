import { prismaMock } from '../__mocks__/prisma';
const mockPrisma = prismaMock;

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { Response } from 'express';
import * as messageController from '../controllers/messageController';
import { AuthRequest } from '../middleware/authMiddleware';

describe('Message Controller Tests', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('sendMessage', () => {
    it('should successfully send a message to another user', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
        body: {
          receiverId: '2',
          subject: 'Question about appointment',
          body: 'Hello, I have a question about my booking.',
        },
      } as unknown as AuthRequest;

      const mockCreatedMessage = {
        id: 10,
        sender_id: 1,
        receiver_id: 2,
        subject: 'Question about appointment',
        body: 'Hello, I have a question about my booking.',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaMock.message.create.mockResolvedValue(mockCreatedMessage as any);

      await messageController.sendMessage(mockReq, mockRes as Response);

      expect(prismaMock.message.create).toHaveBeenCalledWith({
        data: {
          sender_id: 1,
          receiver_id: 2,
          subject: 'Question about appointment',
          body: 'Hello, I have a question about my booking.',
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedMessage,
      });
    });

    it('should return 401 if unauthorized (no senderId)', async () => {
      const mockReq = {
        body: {
          receiverId: '2',
          subject: 'Test',
          body: 'Test Body',
        },
      } as unknown as AuthRequest;

      await messageController.sendMessage(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 400 if missing required fields', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
        body: {
          receiverId: '',
          subject: 'Test',
          body: '',
        },
      } as unknown as AuthRequest;

      await messageController.sendMessage(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields',
      });
    });

    it('should return 500 when database error occurs', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
        body: {
          receiverId: '2',
          subject: 'Test',
          body: 'Test Body',
        },
      } as unknown as AuthRequest;

      prismaMock.message.create.mockRejectedValue(new Error('Database unique constraint failed'));

      await messageController.sendMessage(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database unique constraint failed',
      });
    });
  });

  describe('getMyMessages', () => {
    it('should retrieve all messages for the logged-in user', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
      } as unknown as AuthRequest;

      const mockMessages = [
        {
          id: 10,
          sender_id: 1,
          receiver_id: 2,
          subject: 'Test 1',
          body: 'Body 1',
          is_read: false,
          created_at: new Date(),
          updated_at: new Date(),
          sender: { id: 1, username: 'customer1', role: 'customer' },
          receiver: { id: 2, username: 'staff1', role: 'staff' },
        },
        {
          id: 11,
          sender_id: 3,
          receiver_id: 1,
          subject: 'Test 2',
          body: 'Body 2',
          is_read: true,
          created_at: new Date(),
          updated_at: new Date(),
          sender: { id: 3, username: 'manager1', role: 'manager' },
          receiver: { id: 1, username: 'customer1', role: 'customer' },
        },
      ];

      prismaMock.message.findMany.mockResolvedValue(mockMessages as any);

      await messageController.getMyMessages(mockReq, mockRes as Response);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ sender_id: 1 }, { receiver_id: 1 }],
        },
        include: {
          sender: { select: { id: true, username: true, role: true } },
          receiver: { select: { id: true, username: true, role: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockMessages,
      });
    });

    it('should return 500 when database error occurs during fetch', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
      } as unknown as AuthRequest;

      prismaMock.message.findMany.mockRejectedValue(new Error('Connection failure'));

      await messageController.getMyMessages(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Connection failure',
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read successfully', async () => {
      const mockReq = {
        user: { sub: '2', role: 'staff' },
        params: { id: '10' },
      } as unknown as AuthRequest;

      const mockUpdatedMessage = {
        id: 10,
        sender_id: 1,
        receiver_id: 2,
        subject: 'Test',
        body: 'Body',
        is_read: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaMock.message.update.mockResolvedValue(mockUpdatedMessage as any);

      await messageController.markAsRead(mockReq, mockRes as Response);

      expect(prismaMock.message.update).toHaveBeenCalledWith({
        where: {
          id: 10,
          receiver_id: 2,
        },
        data: { is_read: true },
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedMessage,
      });
    });

    it('should return 500 if database error or not found occurs', async () => {
      const mockReq = {
        user: { sub: '2', role: 'staff' },
        params: { id: '999' },
      } as unknown as AuthRequest;

      prismaMock.message.update.mockRejectedValue(new Error('Record to update not found'));

      await messageController.markAsRead(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Record to update not found',
      });
    });
  });
});
