import { Response } from 'express';
import { prismaMock } from '../__mocks__/prisma';
import * as reviewController from '../controllers/reviewController';
import { AuthRequest } from '../middleware/authMiddleware';

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

describe('Review Controller Tests', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('submitReview', () => {
    it('should successfully submit a review with comment and image_url', async () => {
      const mockReq = {
        user: { sub: '1', role: 'customer' },
        body: {
          appointmentItemId: '10',
          rating: '5',
          tags: ['Professional', 'Punctual'],
          comment: 'Perfect nail session!',
          imageUrl: 'https://cloudinary.com/test-nail-image.png',
        },
      } as unknown as AuthRequest;

      const mockCustomerProfile = {
        id: 101,
        user_id: 1,
        full_name: 'Test Customer',
      };

      const mockAppointmentItem = {
        id: 10,
        appointment_id: 50,
        service_id: 5,
        staff_id: 2,
        status: 'completed',
      };

      const mockCreatedReview = {
        id: 201,
        customer_id: 101,
        staff_id: 2,
        appointment_item_id: 10,
        rating: 5,
        tags: ['Professional', 'Punctual'],
        comment: 'Perfect nail session!',
        image_url: 'https://cloudinary.com/test-nail-image.png',
        is_approved_for_public: false,
      };

      prismaMock.customerProfile.findUnique.mockResolvedValue(mockCustomerProfile as any);
      prismaMock.appointmentItem.findFirst.mockResolvedValue(mockAppointmentItem as any);
      prismaMock.review.create.mockResolvedValue(mockCreatedReview as any);

      await reviewController.submitReview(mockReq, mockRes as Response);

      expect(prismaMock.customerProfile.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
      expect(prismaMock.appointmentItem.findFirst).toHaveBeenCalledWith({
        where: {
          id: 10,
          appointment: { customer_id: 101 },
          status: 'completed',
        },
      });
      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: {
          customer_id: 101,
          staff_id: 2,
          appointment_item_id: 10,
          rating: 5,
          tags: ['Professional', 'Punctual'],
          comment: 'Perfect nail session!',
          image_url: 'https://cloudinary.com/test-nail-image.png',
          is_approved_for_public: false,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedReview,
      });
    });
  });
});
