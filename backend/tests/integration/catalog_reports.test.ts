import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/utils/prisma';

describe('Catalog and Reports Integration Tests', () => {
  let managerToken: string;
  let customerToken: string;
  let customerId: number;
  let categoryId: number;
  let serviceId: number;

  beforeAll(async () => {
    // Clean up database or ensure clean state if needed
    // For now, let's just create the necessary users
    
    // Create Manager
    const managerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Manager',
        email: 'manager@test.com',
        password: 'Password123!',
        phone: '1111111111'
      });
    
    // Manually update role to manager in DB because register defaults to customer
    await prisma.user.update({
      where: { email: 'manager@test.com' },
      data: { role: 'manager' }
    });

    const managerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'manager@test.com',
        password: 'Password123!'
      });
    managerToken = managerLogin.body.data.tokens.accessToken;

    // Create Customer
    const customerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Customer',
        email: 'customer@test.com',
        password: 'Password123!',
        phone: '2222222222'
      });
    customerToken = customerResponse.body.data.tokens.accessToken;
    customerId = customerResponse.body.data.user.id;
  });

  describe('Service Category Management', () => {
    it('should create a new category (Manager only)', async () => {
      const response = await request(app)
        .post('/api/v1/services/categories')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Nails',
          description: 'All nail services'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Nails');
      categoryId = response.body.data.id;
    });

    it('should fail to create category for non-manager', async () => {
      const response = await request(app)
        .post('/api/v1/services/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Category'
        });

      expect(response.status).toBe(403);
    });

    it('should update a category', async () => {
      const response = await request(app)
        .put(`/api/v1/services/categories/${categoryId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Nails Updated',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Nails Updated');
    });

    it('should get all categories (Public)', async () => {
      const response = await request(app).get('/api/v1/services/categories');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some((c: any) => c.id === categoryId)).toBe(true);
    });
  });

  describe('Service Management', () => {
    it('should create a new service', async () => {
      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Manicure',
          description: 'Basic manicure',
          duration_minutes: 30,
          price: 500.00,
          category_id: categoryId
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Manicure');
      serviceId = response.body.data.id;
    });

    it('should fail to create service with negative price', async () => {
      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Free Nails',
          description: 'Negative price',
          duration_minutes: 30,
          price: -100.00,
          category_id: categoryId
        });

      expect(response.status).toBe(400);
    });

    it('should update a service', async () => {
      const response = await request(app)
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          price: 600.00,
          is_popular: true
        });

      expect(response.status).toBe(200);
      expect(Number(response.body.data.price)).toBe(600);
      expect(response.body.data.is_popular).toBe(true);
    });

    it('should get all services (Public)', async () => {
      const response = await request(app).get('/api/v1/services');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some((s: any) => s.id === serviceId)).toBe(true);
    });
  });

  describe('Customer Profile Management', () => {
    it('should get own profile', async () => {
      const response = await request(app)
        .get('/api/v1/customers/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user_id).toBe(customerId);
    });

    it('should update own profile', async () => {
      const response = await request(app)
        .put('/api/v1/customers/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          fullName: 'Test Customer Updated',
          preferences: { color: 'pink' },
          allergies: 'None'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.full_name).toBe('Test Customer Updated');
    });

    it('should allow staff to search customers', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .set('Authorization', `Bearer ${managerToken}`)
        .query({ query: 'Test Customer' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Reporting and Analytics', () => {
    it('should fail to access reports for customer', async () => {
      const response = await request(app)
        .get('/api/v1/reports/daily-sales')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
    });

    it('should get daily sales stats (Manager only)', async () => {
      const response = await request(app)
        .get('/api/v1/reports/daily-sales')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRevenue');
    });

    it('should get historical analytics', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get('/api/v1/reports/historical-analytics')
        .set('Authorization', `Bearer ${managerToken}`)
        .query({ startDate: today, endDate: today });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
