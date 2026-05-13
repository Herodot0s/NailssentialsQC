import { clerkClient } from '@clerk/express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testClerk() {
  try {
    console.log('Testing Clerk connection with Secret Key...');
    const users = await clerkClient.users.getUserList({ limit: 1 });
    console.log('Successfully connected to Clerk!');
    console.log(`Found ${users.length} users (limited to 1 for test).`);
    
    const count = await clerkClient.users.getCount();
    console.log(`Total users in Clerk: ${count}`);
  } catch (error) {
    console.error('Clerk connection failed:', error);
  }
}

testClerk();
