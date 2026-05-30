import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('Type of DATABASE_URL:', typeof process.env.DATABASE_URL);
