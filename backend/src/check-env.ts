import dotenv from 'dotenv';
import path from 'path';

// Try loading from backend/.env
dotenv.config();
console.log('1. Loading from current dir (.env):', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');

// Try loading from root/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log('2. Loading from root (../../.env):', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');

if (process.env.DATABASE_URL) {
  console.log('Value starts with:', process.env.DATABASE_URL.substring(0, 30));
  console.log('Value ends with:', process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 10));
  console.log('Length:', process.env.DATABASE_URL.length);
}
