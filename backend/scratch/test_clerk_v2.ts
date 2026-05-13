import { clerkClient } from '@clerk/express';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testClerk() {
  try {
    console.log('--- Clerk Production Sync Check ---');
    console.log('Using Key:', process.env.CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...');
    
    // Test connection
    const userCount = await clerkClient.users.getCount();
    console.log('Total users in Clerk:', userCount);

    const clerkUsers = await clerkClient.users.getUserList({ limit: 10 });
    console.log(`Fetched ${clerkUsers.data.length} users from Clerk.`);

    for (const user of clerkUsers.data) {
      const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;
      console.log(`- User: ${user.id} | Email: ${email} | Name: ${user.firstName} ${user.lastName}`);
    }
    
    console.log('\nSyncing script would upsert these into Prisma...');
    
  } catch (error: any) {
    console.error('Clerk connection failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testClerk();
