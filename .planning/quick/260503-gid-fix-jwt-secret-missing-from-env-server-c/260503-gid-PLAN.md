---
phase: quick
plan: 260503-gid
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/.env
autonomous: true
requirements: [quick-260503-gid]
---

<objective>
Fix JWT_SECRET missing from .env causing server startup failure.

Purpose: Populate empty JWT_SECRET and missing REFRESH_TOKEN_SECRET in backend/.env with cryptographically secure random values.

Output: Updated backend/.env with valid secrets.
</objective>

<context>
@C:/Users/Administrator/Desktop/nailssentialsqc-system/backend/.env
@C:/Users/Administrator/Desktop/nailssentialsqc-system/backend/src/utils/jwt.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Generate and set JWT secrets in .env</name>
  <files>backend/.env</files>
  <action>
    The backend/.env file has JWT_SECRET = '' (empty string) and is missing REFRESH_TOKEN_SECRET entirely.
    Generate cryptographically secure random strings (64 bytes, hex encoded = 128 chars) for both secrets:
    1. Replace JWT_SECRET = '' with JWT_SECRET = 'generated-secret'
    2. Add REFRESH_TOKEN_SECRET = 'generated-secret' after JWT_SECRET line
    
    Use Node.js crypto.randomBytes(64).toString('hex') to generate secrets.
  </action>
  <verify>
    <automated>cat backend/.env | grep JWT_SECRET (expect non-empty value); cat backend/.env | grep REFRESH_TOKEN_SECRET (expect value present)</automated>
  </verify>
  <done>JWT_SECRET and REFRESH_TOKEN_SECRET populated with secure random values in backend/.env</done>
</task>

</tasks>

<verification>
1. JWT_SECRET is non-empty in backend/.env
2. REFRESH_TOKEN_SECRET exists and is non-empty in backend/.env
3. Server can start without jwt.ts throwing missing secret error
</verification>

<success_criteria>
- JWT_SECRET has 128-character hex string value
- REFRESH_TOKEN_SECRET has 128-character hex string value
- backend/.env file format preserved (KEY = 'value' format)
</success_criteria>
