# Coding Conventions

**Analysis Date:** 2026-05-01

## Naming Patterns

### Files

**Backend (TypeScript):**
- **Controllers:** `PascalCase.ts` - e.g., `authController.ts`, `payrollController.ts`
- **Routes:** `PascalCase.ts` - e.g., `authRoutes.ts`, `appointmentRoutes.ts`
- **Middleware:** `PascalCase.ts` - e.g., `authMiddleware.ts`
- **Utils:** `PascalCase.ts` - e.g., `jwt.ts`, `prisma.ts`, `email.ts`

**Frontend (React/TypeScript):**
- **Pages:** `PascalCase.tsx` - e.g., `Login.tsx`, `ManagerDashboard.tsx`
- **Components:** `PascalCase.tsx` - e.g., `Navbar.tsx`, `ProtectedRoute.tsx`
- **UI Components:** `lowercase.tsx` in `components/ui/` - e.g., `button.tsx`, `input.tsx`
- **Context:** `PascalCase.tsx` - e.g., `AuthContext.tsx`, `CartContext.tsx`
- **API Client:** `camelCase.ts` - e.g., `apiClient.ts`
- **Utilities:** `camelCase.ts` - e.g., `utils.ts`

### Functions and Variables

- **Backend:** `camelCase` for functions and variables
- **Frontend:** `camelCase` for functions, variables, and state
- **React Components:** `PascalCase` for component names
- **Custom Hooks:** `camelCase` starting with `use` - e.g., `useAuth`, `useCart`
- **Interface/Type names:** `PascalCase` with optional `Type` suffix - e.g., `User`, `AuthContextType`

### Database Fields (Prisma)

- **Schema fields:** `snake_case` - e.g., `user_id`, `full_name`, `password_hash`
- **Schema file:** `backend/prisma/schema.prisma`

### CSS/Tailwind Classes

- Tailwind classes are used directly with `camelCase` when needed
- Component variants use `cva` (class-variance-authority) pattern in `frontend/src/components/ui/`

## Code Style

### Formatting

**Tool:** Prettier

**Configuration in `.prettierrc`:**
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "endOfLine": "auto"
}
```

**Commands:**
- `npm run format` - Format all files (root)
- `npm run format:frontend` - Format frontend only
- `npm run format:backend` - Format backend only

### Linting

**Backend (`backend/eslint.config.mjs`):**
```javascript
extends: [js.configs.recommended, tseslint.configs.recommended, configPrettier]
rules: {
  'prettier/prettier': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
}
```

**Frontend (`frontend/eslint.config.js`):**
```javascript
extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite, configPrettier]
rules: {
  'prettier/prettier': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  'react-hooks/exhaustive-deps': 'warn'
}
```

**Commands:**
- `npm run lint` - Lint all files
- `npm run lint:frontend` - Lint frontend only
- `npm run lint:backend` - Lint backend only

## Import Organization

### Backend Import Order

1. Node.js built-ins (e.g., `express`, `cors`)
2. External packages (e.g., `bcrypt`, `jsonwebtoken`)
3. Internal paths (`../utils/`, `./routes/`, etc.)

Example in `backend/src/index.ts`:
```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import prisma from './utils/prisma';
```

### Frontend Import Order

1. React-related imports (`react`, `react-dom`)
2. Framework/library imports (`react-router-dom`, `axios`)
3. Internal imports (contexts, utils, API client)
4. Path alias imports (`@/components/...`)
5. Named exports sorted alphabetically

Example in `frontend/src/pages/Login.tsx`:
```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';
```

### Path Aliases

**Frontend:** Uses `@/*` alias for `frontend/src/*`
```json
"paths": {
  "@/*": ["./src/*"]
}
```

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import DrillDownLineChart from '@/components/DrillDownLineChart';
```

## Error Handling

### Backend Response Format

All API responses follow this structure:

**Success:**
```typescript
return res.status(200).json({
  success: true,
  data: { /* payload */ },
});
```

**Error:**
```typescript
return res.status(500).json({
  success: false,
  error: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  },
});
```

### Error Codes Used

- `VALIDATION_ERROR` - Input validation failures
- `EMAIL_ALREADY_EXISTS` - Duplicate email registration
- `PHONE_ALREADY_EXISTS` - Duplicate phone registration
- `INVALID_CREDENTIALS` - Authentication failures
- `ACCOUNT_LOCKED` - Account temporarily locked
- `ACCESS_DENIED` / `UNAUTHORIZED` - Insufficient permissions
- `INVALID_TOKEN` - JWT verification failures
- `TOKEN_REQUIRED` - Missing token
- `INTERNAL_SERVER_ERROR` - Unhandled exceptions

### Error Boundaries

**Backend pattern:**
```typescript
try {
  // controller logic
} catch (error: any) {
  console.error('Operation error:', error);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Descriptive message here',
    },
  });
}
```

**Frontend pattern:**
```typescript
// In API calls
try {
  const response = await apiClient.post('/endpoint', data);
  // handle response
} catch (error: any) {
  const message = error.response?.data?.error?.message || 'Default message';
  setServerError(message);
}
```

## Logging

**Framework:** `console` (not a structured logging library)

**Patterns:**
- Use `console.error` for caught errors with context prefix
- Avoid logging sensitive data (tokens, passwords)
- Optional descriptive prefix strings: `[server]:`

**Examples:**
```typescript
console.error('Registration error:', error);
console.error('Login error:', error);
console.log(`[server]: Server is running at http://localhost:${port}`);
```

## Comments

**When to Comment:**
- JSDoc for exported functions/controllers
- Complex business logic explanations
- TODO/FIXME markers for technical debt

**JSDoc usage in `backend/src/utils/prisma.ts`:**
```typescript
/**
 * Prisma client singleton to prevent multiple instances in serverless environments.
 * This pattern ensures that a single Prisma instance is reused across hot reloads in development
 * and function invocations in serverless deployments.
 */
const prismaClientSingleton = () => { ... }
```

## Function Design

### Controller Functions (Backend)

- Named exports preferred
- Async handlers with try/catch
- Request validation via `express-validator` middleware
- Return appropriate HTTP status codes
- Descriptive operation prefixes

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    // logic
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: '...' },
    });
  }
};
```

### React Components (Frontend)

- Functional components with `React.FC` type
- Hook form for form handling
- Clear separation of state management
- Loading/error states handling

```typescript
const Login: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // ...
};
```

## Module Design

### Backend (Express)

**Pattern:** MVC-like separation
- `controllers/` - Business logic
- `routes/` - Route definitions and validation middleware
- `middleware/` - Auth and shared middleware
- `utils/` - Prisma singleton, JWT utilities, email

**Exports:** Default exports for routes, named exports for controllers

### Frontend (React)

**Pattern:** Context-based state + component composition
- `context/` - React context providers
- `components/` - Reusable UI components
- `pages/` - Route-level page components
- `api/` - Axios client with interceptors
- `lib/` - Utility functions (e.g., `cn` for Tailwind)

**Exports:** Default exports for pages and components

## API Response Patterns

### Status Code Usage

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, or action |
| 201 | Resource created |
| 400 | Validation errors |
| 401 | Authentication required |
| 403 | Forbidden / Insufficient permissions |
| 404 | Resource not found |
| 500 | Server errors |

### Pagination

Not implemented yet in current codebase.

---

*Convention analysis: 2026-05-01*