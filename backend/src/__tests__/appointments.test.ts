import { Request, Response } from 'express';
import { prismaMock } from '../__mocks__/prisma';
import * as appointmentController from '../controllers/appointmentController';
import * as appointmentAvailability from '../controllers/appointmentAvailability';
import * as appointmentCompletion from '../controllers/appointmentCompletion';
import { AuthRequest } from '../middleware/authMiddleware';
import { addMinutes, format } from 'date-fns';

// Mock prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

// Mock email utils
jest.mock('../utils/email', () => ({
  sendBookingConfirmation: jest.fn(),
  sendAppointmentCompletion: jest.fn(),
}));

// Mock system log
jest.mock('../utils/systemLog', () => ({
  logSystemAction: jest.fn(),
}));

describe('Appointment Controller Tests', () => {
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createAppointment', () => {
    const mockCustomerUser = {
      id: 1,
      role: 'customer',
      is_active: true,
      customer_profile: { id: 101, full_name: 'Test Customer' },
    };

    const mockStaffUser = {
      id: 2,
      role: 'staff',
      is_active: true,
      staff_profile: { id: 201, full_name: 'Test Staff', user_id: 2 },
    };

    const mockService = {
      id: 1,
      name: 'Nail Art',
      duration_minutes: 60,
      price: 500,
    };

    it('should successfully book an appointment for a customer', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = format(futureDate, 'yyyy-MM-dd');

      const mockReq = {
        user: { sub: 1, role: 'customer' },
        body: {
          date: dateStr,
          items: [
            {
              serviceId: '1',
              staffId: '2',
              startTime: '14:00',
            },
          ],
        },
      } as unknown as AuthRequest;

      // Mock sequence of prisma calls
      prismaMock.user.findUnique.mockResolvedValue(mockCustomerUser as any);
      prismaMock.customerProfile.findUnique.mockResolvedValue(
        mockCustomerUser.customer_profile as any,
      );
      prismaMock.service.findUnique.mockResolvedValue(mockService as any);
      prismaMock.staffProfile.findFirst.mockResolvedValue(mockStaffUser.staff_profile as any);
      prismaMock.appointmentItem.findMany.mockResolvedValue([]); // No conflicts

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.appointment.create.mockResolvedValue({ id: 501, status: 'pending' } as any);
      prismaMock.appointmentItem.create.mockResolvedValue({ id: 601 } as any);

      await appointmentController.createAppointment(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 501,
            message: 'Appointment booked successfully!',
          }),
        }),
      );
    });

    it('should fail if the technician is already booked (Conflict Prevention)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = format(futureDate, 'yyyy-MM-dd');

      const mockReq = {
        user: { sub: 1, role: 'customer' },
        body: {
          date: dateStr,
          items: [
            {
              serviceId: '1',
              staffId: '2',
              startTime: '14:00',
            },
          ],
        },
      } as unknown as AuthRequest;

      prismaMock.user.findUnique.mockResolvedValue(mockCustomerUser as any);
      prismaMock.customerProfile.findUnique.mockResolvedValue(
        mockCustomerUser.customer_profile as any,
      );
      prismaMock.service.findUnique.mockResolvedValue(mockService as any);
      prismaMock.staffProfile.findFirst.mockResolvedValue(mockStaffUser.staff_profile as any);

      // Mock a conflict
      prismaMock.appointmentItem.findMany.mockResolvedValue([
        {
          start_time: '13:30',
          end_time: '14:30',
          staff_id: 201,
        },
      ] as any);

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      await appointmentController.createAppointment(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BAD_REQUEST',
            message: expect.stringContaining('already booked'),
          }),
        }),
      );
    });
  });

  describe('getAvailableSlots (WR-02: Multi-slot Fix)', () => {
    it('should correctly identify available slots for multiple technicians', async () => {
      const dateStr = '2026-06-01';
      const mockReq = {
        query: {
          date: dateStr,
          duration: '60',
          slot_increment: '30',
          count: '1',
        },
      } as unknown as Request;

      const technicians = [
        { id: 1, full_name: 'Tech 1', is_available: true },
        { id: 2, full_name: 'Tech 2', is_available: true },
      ];

      prismaMock.staffProfile.findMany.mockResolvedValue(technicians as any);

      // Tech 1 busy from 13:00 to 14:00
      prismaMock.appointmentItem.findMany.mockResolvedValue([
        {
          start_time: '13:00',
          end_time: '14:00',
          staff_id: 1,
        },
      ] as any);

      await appointmentAvailability.getAvailableSlots(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = (mockRes.json as jest.Mock).mock.calls[0][0].data;

      // Slot 13:00 should be available because Tech 2 is free
      const slot1300 = responseData.find((s: any) => s.time === '13:00');
      expect(slot1300.available).toBe(true);
      expect(slot1300.availableTechnicianIds).toContain(2);
      expect(slot1300.availableTechnicianIds).not.toContain(1);

      // Slot 14:00 should be available for both
      const slot1400 = responseData.find((s: any) => s.time === '14:00');
      expect(slot1400.available).toBe(true);
      expect(slot1400.availableTechnicianIds).toContain(1);
      expect(slot1400.availableTechnicianIds).toContain(2);
    });

    it('should show slot as unavailable if no technicians are free for the required duration', async () => {
      const dateStr = '2026-06-01';
      const mockReq = {
        query: {
          date: dateStr,
          duration: '60',
          slot_increment: '30',
          count: '1',
        },
      } as unknown as Request;

      const technicians = [{ id: 1, full_name: 'Tech 1', is_available: true }];

      prismaMock.staffProfile.findMany.mockResolvedValue(technicians as any);

      // Tech 1 busy from 13:30 to 14:30
      prismaMock.appointmentItem.findMany.mockResolvedValue([
        {
          start_time: '13:30',
          end_time: '14:30',
          staff_id: 1,
        },
      ] as any);

      await appointmentAvailability.getAvailableSlots(mockReq, mockRes as Response);

      // Slot 13:00 (60min duration) overlaps with 13:30-14:30
      const responseData = (mockRes.json as jest.Mock).mock.calls[0][0].data;
      const slot1300 = responseData.find((s: any) => s.time === '13:00');
      expect(slot1300.available).toBe(false);
    });
  });

  describe('completeAppointment', () => {
    it('should successfully complete an appointment and create commissions', async () => {
      const mockAppt = {
        id: 501,
        status: 'pending',
        customer_id: 101,
        customer: { user_id: 1 },
        items: [
          {
            id: 601,
            price_at_booking: 500,
            staff_id: 201,
            service_id: 1,
            staff: { user_id: 2, specializations: 'Nails' },
            service: {
              category: { name: 'Nails' },
            },
          },
        ],
      };

      const mockReq = {
        params: { id: '501' },
        body: {
          paymentMethod: 'cash',
          servicePhotoUrl: 'http://example.com/photo.jpg',
        },
      } as unknown as AuthRequest;

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppt as any);
      prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 60000 } } as any); // Tier 10%

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.transaction.count.mockResolvedValue(10);
      prismaMock.transaction.create.mockResolvedValue({ id: 701 } as any);
      prismaMock.commission.create.mockResolvedValue({ id: 801 } as any);

      await appointmentCompletion.completeAppointment(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(prismaMock.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 501 },
          data: {
            status: 'completed',
            service_photo_url: 'http://example.com/photo.jpg',
          },
        }),
      );
      expect(prismaMock.commission.create).toHaveBeenCalled();
    });

    it('should overwrite appointmentItem end_time with the current system time in HH:mm format', async () => {
      const mockAppt = {
        id: 502,
        status: 'pending',
        customer_id: 101,
        customer: { user_id: 1 },
        items: [
          {
            id: 602,
            price_at_booking: 500,
            staff_id: 201,
            service_id: 1,
            staff: { user_id: 2, specializations: 'Nails' },
            service: {
              category: { name: 'Nails' },
            },
          },
        ],
      };

      const mockReq = {
        params: { id: '502' },
        body: {
          paymentMethod: 'cash',
          servicePhotoUrl: 'http://example.com/photo.jpg',
        },
      } as unknown as AuthRequest;

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppt as any);
      prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 60000 } } as any);
      prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
      prismaMock.transaction.count.mockResolvedValue(10);
      prismaMock.transaction.create.mockResolvedValue({ id: 702 } as any);
      prismaMock.commission.create.mockResolvedValue({ id: 802 } as any);

      await appointmentCompletion.completeAppointment(mockReq, mockRes as Response);

      expect(prismaMock.appointmentItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { appointment_id: 502 },
          data: expect.objectContaining({
            status: 'completed',
            end_time: expect.stringMatching(/^\d{2}:\d{2}$/),
          }),
        })
      );
    });
  });
});
