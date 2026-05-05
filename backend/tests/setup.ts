import dotenv from 'dotenv';
import path from 'path';
import { truncateAllTables } from './helpers/database';
import prisma from '../src/utils/prisma';

// Load .env.test from the project root
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Also try loading from backend/.env.test if root one doesn't exist or doesn't have what we need
dotenv.config({ path: path.join(__dirname, '../.env.test') });

beforeAll(async () => {
  // Safety check: Verify we are NOT using the production DB
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.includes('neon')) {
    console.error('Current DATABASE_URL:', dbUrl);
    throw new Error('Tests must be run against a database with "test" in the URL for safety.');
  }
});

afterAll(async () => {
  // Ensure we disconnect prisma after all tests in a file are done
  await prisma.$disconnect();
});

// Truncate all tables before all tests in the file to ensure isolation
beforeAll(async () => {
  await truncateAllTables();
});
