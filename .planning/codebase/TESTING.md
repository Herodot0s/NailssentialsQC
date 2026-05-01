# Testing Patterns

**Analysis Date:** 2026-05-01

## Current State

**Testing:** NOT IMPLEMENTED

The codebase currently has no test infrastructure. The root `package.json` and `backend/package.json` both contain stub test commands:

```json
// Root package.json
"test": "echo \"Error: no test specified\" && exit 1"

// backend/package.json
"test": "echo \"Error: no test specified\" && exit 1"
```

No test framework is installed in either `backend` or `frontend` packages.

## Recommended Testing Setup

Based on the existing codebase patterns, the following testing stack is recommended:

### Backend Testing

**Recommended Framework:** Jest + Supertest

**Packages to add to `backend/package.json`:**
```json
"devDependencies": {
  "@types/jest": "^29.5.0",
  "@types/supertest": "^6.0.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.0",
  "ts-jest": "^29.1.0"
}
```

**Jest Configuration (`backend/jest.config.ts`):**
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
```

### Frontend Testing

**Recommended Framework:** Vitest + React Testing Library

**Packages to add to `frontend/package.json`:**
```json
"devDependencies": {
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^24.0.0",
  "vitest": "^1.0.0"
}
```

**Vitest Configuration (`frontend/vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Test File Organization

### Recommended Structure

**Backend:**
```
backend/
  src/
    __tests__/
      controllers/
        authController.test.ts
        appointmentController.test.ts
      middleware/
        authMiddleware.test.ts
      routes/
        authRoutes.test.ts
    fixtures/
      users.ts
      appointments.ts
```

**Frontend:**
```
frontend/
  src/
    __tests__/
      components/
        Button.test.tsx
        Navbar.test.tsx
      pages/
        Login.test.tsx
        ManagerDashboard.test.tsx
      context/
        AuthContext.test.tsx
    test/
      setup.ts
      mocks/
        handlers.ts
        browser.ts
```

## Test Patterns Based on Codebase

### Backend Controller Testing Pattern

Example test structure for `authController.ts`:

```typescript
import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Setup test database state
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany({ where: {} });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'Password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### Frontend Component Testing Pattern

Example test structure for `Login.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/email or phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    expect(await screen.findByText(/email or phone is required/i)).toBeInTheDocument();
  });
});
```

### Mocking Patterns

**API Mocking (Backend):**
```typescript
jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyAccessToken: jest.fn(() => ({ sub: 1, email: 'test@test.com' })),
  verifyRefreshToken: jest.fn(() => ({ sub: 1 })),
}));
```

**Context Mocking (Frontend):**
```typescript
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
```

**Prisma Mocking:**
```typescript
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));
```

## Fixtures and Factories

### Backend Test Fixtures

**Location:** `backend/src/__fixtures__/` or within test files

```typescript
// Example: users.ts fixture
export const testUser = {
  email: 'test@example.com',
  phone: '09123456789',
  fullName: 'Test User',
  role: 'customer',
};

export const testStaffUser = {
  ...testUser,
  email: 'staff@example.com',
  role: 'staff',
};

export const testManagerUser = {
  ...testUser,
  email: 'manager@example.com',
  role: 'manager',
};
```

### Frontend Test Data

```typescript
// Example: mock API responses
export const mockUserResponse = {
  success: true,
  data: {
    user: {
      id: 1,
      email: 'test@example.com',
      role: 'customer',
      fullName: 'Test User',
    },
  },
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};
```

## Coverage Requirements

**Recommended targets:**
- Backend controllers: 80% line coverage minimum
- Backend middleware: 90% line coverage minimum
- Frontend components: 70% line coverage minimum
- Critical paths (auth, payments): 90% line coverage

**Generate coverage reports:**
```bash
# Backend
npm run test -- --coverage

# Frontend
npm run test -- --coverage
```

## Test Types

### Unit Tests
- Individual controller functions
- Utility functions (JWT, Prisma helpers)
- React component rendering
- Context state management

### Integration Tests
- Route-level testing with Supertest
- Database transactions
- Token refresh flows
- Multi-step booking flows

### E2E Tests (Future)
- Critical user journeys
- Registration and login
- Appointment booking
- Manager dashboard operations
- Tools like Playwright recommended

## What to Test

### High Priority (Should be tested)
1. Authentication flows (register, login, logout, token refresh)
2. Authorization middleware
3. Validation middleware
4. Appointment creation and completion
5. Commission calculations
6. Protected routes
7. Auth context state management

### Medium Priority
1. Form validation
2. API client interceptors
3. Cart context operations
4. UI component variants

### Lower Priority
1. Simple display components
2. Static pages
3. Helper utility functions (already simple)

## Adding Tests to This Project

1. Install test dependencies:
```bash
npm install -D jest @types/jest ts-jest --prefix backend
npm install -D vitest @testing-library/react @testing-library/user-event jsdom --prefix frontend
```

2. Configure test runner

3. Create test files following the patterns above

4. Run tests:
```bash
npm run test --prefix backend
npm run test --prefix frontend
```

---

*Testing analysis: 2026-05-01*