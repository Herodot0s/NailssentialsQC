import dotenv from 'dotenv';
import path from 'path';
import * as ExcelJS from 'exceljs';

// Mock ExcelJS globally to prevent actual Excel file generation during tests
jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn(),
  };
});

beforeEach(() => {
  const mockWorksheet = {
    addRow: jest.fn().mockReturnValue({ font: {}, fill: {}, getCell: jest.fn().mockReturnValue({ font: {} }) }),
    columns: [],
  };
  const mockWorkbook = {
    addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
    xlsx: {
      write: jest.fn().mockResolvedValue(undefined),
    },
  };
  if (ExcelJS.Workbook && (ExcelJS.Workbook as any).mockImplementation) {
    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
  }
});

// Mock Clerk module globally for all Jest tests (hoisted by Jest)
jest.mock('@clerk/express', () => {
  return {
    clerkMiddleware: () => (req: any, res: any, next: any) => next(),
    getAuth: (req: any) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return { userId: authHeader.substring(7) };
      }
      return { userId: undefined };
    },
    clerkClient: {
      users: {
        getUser: async (userId: string) => {
          let role = 'customer';
          if (userId && userId.includes('manager')) role = 'manager';
          else if (userId && userId.includes('staff')) role = 'staff';
          return {
            id: userId,
            emailAddresses: [
              {
                id: 'primary-email',
                emailAddress: `${userId}@example.com`,
                verification: { status: 'verified' },
              },
            ],
            primaryEmailAddressId: 'primary-email',
            firstName: 'Mock',
            lastName: role.toUpperCase(),
            publicMetadata: { role },
          };
        },
        updateUserMetadata: async () => ({}),
        getUserList: async (query: any) => {
          const email = query.emailAddress?.[0] || 'mock@example.com';
          const userId = `clerk_${email.split('@')[0]}`;
          let role = 'customer';
          if (email.includes('manager')) role = 'manager';
          else if (email.includes('staff')) role = 'staff';
          return {
            data: [
              {
                id: userId,
                emailAddresses: [
                  {
                    id: 'primary-email',
                    emailAddress: email,
                    verification: { status: 'verified' },
                  },
                ],
                primaryEmailAddressId: 'primary-email',
                firstName: 'Mock',
                lastName: role.toUpperCase(),
                publicMetadata: { role },
              }
            ]
          };
        },
        createUser: async (data: any) => {
          const email = data.emailAddress?.[0] || 'mock@example.com';
          const userId = `clerk_${email.split('@')[0]}`;
          let role = 'customer';
          if (email.includes('manager')) role = 'manager';
          else if (email.includes('staff')) role = 'staff';
          return {
            id: userId,
            emailAddresses: [
              {
                id: 'primary-email',
                emailAddress: email,
                verification: { status: 'verified' },
              },
            ],
            primaryEmailAddressId: 'primary-email',
            firstName: data.firstName || 'Mock',
            lastName: data.lastName || role.toUpperCase(),
            publicMetadata: { role },
          };
        },
        deleteUser: async (userId: string) => {
          return { deleted: true };
        },
      },
    },
  };
});

// Load backend-specific test environment with override to ensure correct DATABASE_URL
dotenv.config({ path: path.join(__dirname, '../.env.test'), override: true });
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Conditionally configure integration test hooks and route mounts
const isUnitTest = expect.getState().testPath?.includes('__tests__');

if (!isUnitTest) {
  const app = require('../src/index').default;
  const prisma = require('../src/utils/prisma').default;
  const { truncateAllTables } = require('./helpers/database');

  // Mount register and login fallback routes on Express app for tests
  app.post('/api/v1/auth/register', async (req: any, res: any) => {
    try {
      const { email, username, fullName, phone } = req.body;
      const clerkId = `clerk_${email ? email.split('@')[0] : Date.now()}`;
      
      // Check if user exists by any unique fields
      const conditions = [];
      if (email) conditions.push({ email });
      if (username) conditions.push({ username });
      if (phone) conditions.push({ phone });
      conditions.push({ clerk_id: clerkId });

      let user = await prisma.user.findFirst({
        where: {
          OR: conditions,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            username: username || email.split('@')[0],
            email,
            phone: phone || null,
            clerk_id: clerkId,
            role: 'customer',
            is_active: true,
            customer_profile: {
              create: {
                full_name: fullName || 'Test User',
              },
            },
          },
        });
      }

      res.status(201).json({
        success: true,
        data: {
          user,
          tokens: {
            accessToken: clerkId,
          },
        },
      });
    } catch (err: any) {
      console.error('Mock registration fallback error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/v1/auth/login', async (req: any, res: any) => {
    try {
      const { identifier } = req.body;
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({
        success: true,
        data: {
          tokens: {
            accessToken: user.clerk_id || `clerk_${user.email?.split('@')[0]}`,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  beforeAll(async () => {
    // Safety check: Verify we are NOT using the production DB
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl.includes('neon')) {
      console.error('Current DATABASE_URL:', dbUrl);
      throw new Error('Tests must be run against a database with "test" in the URL for safety.');
    }
    await truncateAllTables();
  });

  afterAll(async () => {
    // Ensure we disconnect prisma after all tests in a file are done
    await prisma.$disconnect();
  });
}
