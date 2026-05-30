import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Customer CRUD Integration Tests', () => {
  let managerToken: string;
  let staffToken: string;
  let managerUserId: number;
  let testCustomerId: number;

  const getUniquePayload = (roleEmail: string) => {
    const randomId = Math.random().toString(36).substring(7);
    return {
      fullName: `Test ${roleEmail}`,
      email: `${roleEmail}_${randomId}@example.com`,
      password: 'Password123',
      phone: `123${Math.random().toString().slice(2, 12)}`.slice(0, 10),
      username: `${roleEmail}_${randomId}`,
    };
  };

  beforeAll(async () => {
    // 1. Create a Manager
    const managerPayload = getUniquePayload('managercust');
    const managerReg = await request(app).post('/api/v1/auth/register').send({
      fullName: managerPayload.fullName,
      email: managerPayload.email,
      password: managerPayload.password,
      phone: managerPayload.phone,
    });

    if (!managerReg.body.success) {
      console.log('REGISTRATION FAILED STATUS:', managerReg.status);
      console.log('REGISTRATION FAILED TEXT:', managerReg.text);
      throw new Error(`Manager registration failed: ${JSON.stringify(managerReg.body)}`);
    }

    managerUserId = managerReg.body.data.user.id;
    await prisma.user.update({
      where: { id: managerUserId },
      data: { role: 'manager' },
    });

    const managerLogin = await request(app).post('/api/v1/auth/login').send({
      identifier: managerPayload.email,
      password: managerPayload.password,
    });
    managerToken = managerLogin.body.data.tokens.accessToken;

    // 2. Create a Staff User for testing permissions
    const staffPayload = getUniquePayload('staffcust');
    const staffReg = await request(app).post('/api/v1/auth/register').send({
      fullName: staffPayload.fullName,
      email: staffPayload.email,
      password: staffPayload.password,
      phone: staffPayload.phone,
    });

    await prisma.user.update({
      where: { id: staffReg.body.data.user.id },
      data: { role: 'staff' },
    });

    const staffLogin = await request(app).post('/api/v1/auth/login').send({
      identifier: staffPayload.email,
      password: staffPayload.password,
    });
    staffToken = staffLogin.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Customer CRUD Operations', () => {
    it('should create a new customer (Manager only)', async () => {
      const customerPayload = getUniquePayload('customer');
      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          fullName: customerPayload.fullName,
          email: customerPayload.email,
          phone: customerPayload.phone,
          username: customerPayload.username,
          password: 'Password123',
          allergies: 'Acrylic monomer, Latex',
          notes: 'Enjoys luxury gel designs and calm environment.',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.fullName).toBe(customerPayload.fullName);
      expect(response.body.data.allergies).toBe('Acrylic monomer, Latex');
      testCustomerId = response.body.data.id;
    });

    it('should list all customers with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);

      const found = response.body.data.items.find((c: any) => c.id === testCustomerId);
      expect(found).toBeDefined();
    });

    it('should update customer profile details', async () => {
      const response = await request(app)
        .put(`/api/v1/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          fullName: 'Updated Customer Name',
          allergies: 'Acrylic monomer, Latex, UV lamps',
          notes: 'Only prefers square nails.',
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('Updated Customer Name');
      expect(response.body.data.allergies).toBe('Acrylic monomer, Latex, UV lamps');
      expect(response.body.data.isActive).toBe(false);
    });

    it('should block non-managers from CRUD operations', async () => {
      const customerPayload = getUniquePayload('unauthcust');
      // Create Block
      const createResponse = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          fullName: customerPayload.fullName,
          email: customerPayload.email,
          username: customerPayload.username,
        });
      expect(createResponse.status).toBe(403);

      // Update Block
      const updateResponse = await request(app)
        .put(`/api/v1/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          fullName: 'Staff Hack Name',
        });
      expect(updateResponse.status).toBe(403);

      // Delete Block
      const deleteResponse = await request(app)
        .delete(`/api/v1/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${staffToken}`);
      expect(deleteResponse.status).toBe(403);
    });

    it('should delete customer profile and cascade user account', async () => {
      const response = await request(app)
        .delete(`/api/v1/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion from db
      const profile = await prisma.customerProfile.findUnique({
        where: { id: testCustomerId },
      });
      expect(profile).toBeNull();
    });
  });
});
