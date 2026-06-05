// Mock prisma and notificationController first
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    staffProfile: {
      findUnique: jest.fn(),
    },
    attendance: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    staffSchedule: {
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../controllers/notificationController', () => ({
  createNotification: jest.fn(),
}));

import { Response } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

describe('Attendance Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      user: {
        sub: 1,
        email: 'staff@example.com',
        role: 'staff',
        type: 'access',
      },
    };
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };
  });

  describe('getAttendanceStatus', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      await attendanceController.getAttendanceStatus(mockRequest as AuthRequest, mockResponse as Response);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 404 if staff profile is not found', async () => {
      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(null);
      await attendanceController.getAttendanceStatus(mockRequest as AuthRequest, mockResponse as Response);
      expect(statusSpy).toHaveBeenCalledWith(404);
    });

    it('should return attendance status and logs', async () => {
      const mockStaff = { id: 10, full_name: 'Test Staff', scheduled_start: '12:00:00', scheduled_end: '22:00:00' };
      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaff);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue({
        check_in: new Date(),
        check_out: null,
        scheduled_start: '12:00:00',
        scheduled_end: '22:00:00',
        date: new Date()
      });
      (prisma.staffSchedule.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

      await attendanceController.getAttendanceStatus(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          staffName: 'Test Staff',
          status: expect.objectContaining({
            isCheckedIn: true
          })
        })
      }));
    });
  });

  describe('checkIn', () => {
    it('should successfully check in a staff member', async () => {
      const mockStaff = { id: 10, full_name: 'Test Staff', scheduled_start: '12:00:00', scheduled_end: '22:00:00' };
      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaff);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.staffSchedule.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.attendance.upsert as jest.Mock).mockResolvedValue({ id: 1, staff_id: 10 });
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await attendanceController.checkIn(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(prisma.attendance.upsert).toHaveBeenCalled();
    });

    it('should return 400 if already checked out for today', async () => {
      const mockStaff = { id: 10, full_name: 'Test Staff' };
      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaff);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue({ check_out: new Date() });

      await attendanceController.checkIn(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'ALREADY_CHECKED_OUT' })
      }));
    });
  });

  describe('checkOut (Midnight Fix CR-04)', () => {
    it('should successfully check out by finding the most recent active check-in', async () => {
      const mockStaff = { id: 10, full_name: 'Test Staff', scheduled_end: '22:00:00' };
      const mockAttendance = { id: 5, staff_id: 10, check_in: new Date(), check_out: null, date: new Date() };

      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaff);
      (prisma.attendance.findFirst as jest.Mock).mockResolvedValue(mockAttendance);
      (prisma.attendance.update as jest.Mock).mockResolvedValue({ ...mockAttendance, check_out: new Date() });
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await attendanceController.checkOut(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      // Verify it used findFirst with check_out: null ordered by date desc (the midnight fix)
      expect(prisma.attendance.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { staff_id: 10, check_out: null },
        orderBy: { date: 'desc' }
      }));
    });

    it('should return 400 if no active check-in is found', async () => {
      const mockStaff = { id: 10 };
      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue(mockStaff);
      (prisma.attendance.findFirst as jest.Mock).mockResolvedValue(null);

      await attendanceController.checkOut(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_CHECKED_IN' })
      }));
    });
  });

  describe('getAllAttendance', () => {
    it('should fetch all attendance records for managers', async () => {
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([
        { id: 1, staff: { full_name: 'Staff 1' } },
        { id: 2, staff: { full_name: 'Staff 2' } }
      ]);

      mockRequest.query = { startDate: '2026-05-01', endDate: '2026-05-31' };
      await attendanceController.getAllAttendance(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Array)
      }));
    });
  });
});
