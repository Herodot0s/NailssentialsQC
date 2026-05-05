import request from 'supertest';
import app from '../src/index';
import prisma from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/jwt';

// Mock Vercel Blob
jest.mock('@vercel/blob', () => ({
  del: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Exhibit Controller', () => {
  let managerToken: string;
  let staffId: number;

  beforeAll(async () => {
    // Clean up
    await prisma.exhibit.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create a manager user
    const managerUser = await prisma.user.create({
      data: {
        username: 'testmanager',
        password_hash: 'hash',
        role: 'manager',
      },
    });

    managerToken = `Bearer ${generateAccessToken({ sub: managerUser.id, email: managerUser.email || '', role: 'manager' })}`;

    // Create a staff user and profile
    const staffUser = await prisma.user.create({
      data: {
        username: 'teststaff',
        password_hash: 'hash',
        role: 'staff',
      },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: staffUser.id,
        full_name: 'Test Staff',
      },
    });
    staffId = staffProfile.id;
  });

  afterAll(async () => {
    await prisma.exhibit.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/exhibits', () => {
    it('should create a new exhibit as manager', async () => {
      const response = await request(app)
        .post('/api/v1/exhibits')
        .set('Authorization', managerToken)
        .send({
          title: 'Amazing Nail Art',
          image_url: 'https://example.com/image.png',
          staff_id: staffId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Amazing Nail Art');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/exhibits')
        .send({
          title: 'Unauthorized',
          image_url: 'https://example.com/unauthorized.png',
          staff_id: staffId,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/exhibits', () => {
    it('should return a list of active exhibits', async () => {
      const response = await request(app).get('/api/v1/exhibits');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/exhibits/:id', () => {
    it('should delete an exhibit as manager', async () => {
      const allExhibits = await prisma.exhibit.findMany();
      const exhibitId = allExhibits[0].id;

      const response = await request(app)
        .delete(`/api/v1/exhibits/${exhibitId}`)
        .set('Authorization', managerToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Exhibit deleted successfully');
    });
  });
});
