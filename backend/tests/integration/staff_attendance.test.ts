import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Staff & Attendance Integration Tests', () => {
  let managerToken: string;
  let staffToken: string;
  let staffUserId: number;
  let staffProfileId: number;

  beforeAll(async () => {
    // Clear existing users to avoid conflicts
    await prisma.attendance.deleteMany({});
    await prisma.staffSchedule.deleteMany({});
    await prisma.staffProfile.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'manager_staff@example.com',
            'test_staff@example.com',
            'new_staff@example.com',
          ],
        },
      },
    });

    // 1. Create a Manager
    const managerReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Manager Staff Test',
        email: 'manager_staff@example.com',
        password: 'Password123',
        phone: '1111111111',
      });
    
    await prisma.user.update({
      where: { id: managerReg.body.data.user.id },
      data: { role: 'manager' }
    });

    const managerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'manager_staff@example.com',
        password: 'Password123',
      });
    managerToken = managerLogin.body.data.tokens.accessToken;

    // 2. Create a Staff User for testing attendance
    const staffReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Staff',
        email: 'test_staff@example.com',
        password: 'Password123',
        phone: '2222222222',
      });
    
    staffUserId = staffReg.body.data.user.id;
    await prisma.user.update({
      where: { id: staffUserId },
      data: { role: 'staff' }
    });

    // Cleanup customer profile and create staff profile
    await prisma.customerProfile.delete({ where: { user_id: staffUserId } });
    const profile = await prisma.staffProfile.create({
      data: {
        user_id: staffUserId,
        full_name: 'Test Staff',
        base_pay_per_week: 2500,
        scheduled_start: "09:00:00",
        scheduled_end: "18:00:00"
      }
    });
    staffProfileId = profile.id;

    const staffLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'test_staff@example.com',
        password: 'Password123',
      });
    staffToken = staffLogin.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Staff Management', () => {
    let newStaffId: number;

    it('should create a new staff member (Manager only)', async () => {
      const response = await request(app)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          fullName: 'New Staff Member',
          email: 'new_staff@example.com',
          username: 'newstaff',
          password: 'Password123',
          role: 'staff',
          specializations: 'Manicure, Pedicure',
          basePayPerWeek: 3000,
          dailyTarget: 5000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('New Staff Member');
      newStaffId = response.body.data.id;
    });

    it('should list all staff', async () => {
      const response = await request(app)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('should update staff information', async () => {
      const response = await request(app)
        .put(`/api/v1/staff/${newStaffId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          fullName: 'Updated Staff Name',
          basePayPerWeek: 3500,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('Updated Staff Name');
    });

    it('should enforce RBAC: staff cannot create other staff', async () => {
      const response = await request(app)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          fullName: 'Unauthorized Staff',
          email: 'unauth@example.com',
          username: 'unauth',
        });

      expect(response.status).toBe(403);
    });

    it('should get staff schedule', async () => {
      const response = await request(app)
        .get(`/api/v1/staff/${staffUserId}/schedule`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Attendance Tracking', () => {
    it('should clock-in successfully', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.check_in).toBeDefined();
    });

    it('should prevent double clock-in if already checked out', async () => {
      // First, clock out
      await request(app)
        .post('/api/v1/attendance/check-out')
        .set('Authorization', `Bearer ${staffToken}`);

      // Then try to clock in again
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_CHECKED_OUT');
    });

    it('should get attendance status', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/status')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Since we just checked out in the previous test
      expect(response.body.data.status.isCheckedIn).toBe(false);
      expect(response.body.data.status.checkInTime).not.toBeNull();
      expect(response.body.data.status.checkOutTime).not.toBeNull();
    });

    it('should list all attendance records (Manager only)', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/all')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail to clock-out if not checked in (on a different day/new record)', async () => {
        // We can't easily test "different day" without mocking Date
        // But if we delete the record, it should fail
        await prisma.attendance.deleteMany({ where: { staff_id: staffProfileId } });

        const response = await request(app)
            .post('/api/v1/attendance/check-out')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('NOT_CHECKED_IN');
    });
  });

  describe('Security & Edge Cases', () => {
    it('should not allow staff to view all attendance', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/all')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should not allow staff to update their own attendance record directly via PUT', async () => {
        // We need an attendance record first
        const clockInResponse = await request(app)
            .post('/api/v1/attendance/check-in')
            .set('Authorization', `Bearer ${staffToken}`);
        
        const attendanceId = clockInResponse.body.data.id;

        const response = await request(app)
            .put(`/api/v1/attendance/${attendanceId}`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                tardinessMinutes: 0
            });

        expect(response.status).toBe(403);
    });
  });
});
