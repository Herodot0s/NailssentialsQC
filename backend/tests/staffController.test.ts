import request from 'supertest';
import app from '../src/index';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';

describe('Staff Controller Integration Tests', () => {
  let managerToken: string;
  let staffId: number;

  beforeAll(async () => {
    // Create a manager for testing
    const managerPayload = {
      fullName: 'Test Manager',
      email: `manager_${Math.random().toString(36).substring(7)}@example.com`,
      password: 'Password123',
      phone: `09${Math.random().toString().slice(2, 10)}`,
    };

    const registerRes = await request(app).post('/api/v1/auth/register').send(managerPayload);

    // Update role to manager directly in DB since registration defaults to customer
    await prisma.user.update({
      where: { id: registerRes.body.data.user.id },
      data: { role: 'manager' },
    });

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      identifier: managerPayload.email,
      password: managerPayload.password,
    });

    managerToken = loginRes.body.data.tokens.accessToken;
  });

  describe('POST /api/v1/staff', () => {
    it('should create a new staff member', async () => {
      const staffPayload = {
        fullName: 'Jane Staff',
        username: `jane_${Math.random().toString(36).substring(7)}`,
        email: `jane_${Math.random().toString(36).substring(7)}@example.com`,
        password: 'Password123',
        specializations: 'Manicure, Pedicure',
        basePayPerWeek: 3000,
        dailyTarget: 5000,
        role: 'staff',
      };

      const response = await request(app)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(staffPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.fullName).toBe(staffPayload.fullName);

      staffId = response.body.data.id;
    });
  });

  describe('PUT /api/v1/staff/:id', () => {
    it('should update staff profile and verify salt rounds (WR-04)', async () => {
      const updatePayload = {
        fullName: 'Jane Updated',
        password: 'NewPassword123',
      };

      const response = await request(app)
        .put(`/api/v1/staff/${staffId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe(updatePayload.fullName);

      // Verify salt rounds by checking password_hash
      const updatedUser = await prisma.user.findUnique({
        where: { id: staffId },
        select: { password_hash: true }
      });

      expect(updatedUser?.password_hash).toBeDefined();

      // bcrypt hashes starting with $2b$12$ or $2a$12$ indicate 12 rounds
      const passwordMatch = await bcrypt.compare(updatePayload.password, updatedUser!.password_hash!);
      expect(passwordMatch).toBe(true);

      // Indirectly verify salt rounds by checking the hash prefix (bcrypt standard)
      expect(updatedUser?.password_hash).toMatch(/^\$2[ayb]\$12\$.+/);
    });
  });

  describe('Schedule Management', () => {
    it('should update staff schedule', async () => {
      const schedulePayload = {
        schedules: [
          {
            day_of_week: 1, // Monday
            start_time: '09:00:00',
            end_time: '18:00:00',
            is_active: true
          },
          {
            day_of_week: 2, // Tuesday
            start_time: '09:00:00',
            end_time: '18:00:00',
            is_active: true
          }
        ]
      };

      const response = await request(app)
        .put(`/api/v1/staff/${staffId}/schedule`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(schedulePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully');

      // Verify in DB
      const schedules = await prisma.staffSchedule.findMany({
        where: { staff_id: staffId }
      });

      expect(schedules.length).toBe(2);
      expect(schedules.find(s => s.day_of_week === 1)?.start_time).toBe('09:00:00');
    });

    it('should fetch staff schedule', async () => {
      const response = await request(app)
        .get(`/api/v1/staff/${staffId}/schedule`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/v1/staff', () => {
    it('should list all staff members', async () => {
      const response = await request(app)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);

      const jane = response.body.data.items.find((s: any) => s.id === staffId);
      expect(jane).toBeDefined();
    });
  });
});
