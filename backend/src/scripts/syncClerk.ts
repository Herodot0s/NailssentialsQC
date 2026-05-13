import { clerkClient } from '@clerk/express';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function syncClerk() {
  console.log('--- Starting Clerk to Database Sync ---');
  
  try {
    let hasMore = true;
    let offset = 0;
    const limit = 50;
    let totalSynced = 0;

    while (hasMore) {
      const response = await clerkClient.users.getUserList({
        limit,
        offset,
      });

      const clerkUsers = response.data;
      if (clerkUsers.length === 0) {
        hasMore = false;
        break;
      }

      for (const clerkUser of clerkUsers) {
        const email = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
          console.warn(`Skipping user ${clerkUser.id}: No email address found.`);
          continue;
        }

        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        // Upsert user in database
        await prisma.$transaction(async (tx) => {
          // 1. Try to find by clerk_id
          let user = await tx.user.findUnique({
            where: { clerk_id: clerkUser.id },
          });

          // 2. If not found, try to find by email (to link existing accounts)
          if (!user) {
            user = await tx.user.findUnique({
              where: { email },
            });
          }

          if (user) {
            // Update existing user
            await tx.user.update({
              where: { id: user.id },
              data: {
                clerk_id: clerkUser.id,
                // Don't overwrite role if it's already set to something else (e.g. manager)
              },
            });
            console.log(`Updated user: ${email} (${clerkUser.id})`);
          } else {
            // Create new user
            const newUser = await tx.user.create({
              data: {
                clerk_id: clerkUser.id,
                email,
                username: email, // Use email as username for now
                role: 'customer',
                is_active: clerkUser.emailAddresses.some(e => e.verification?.status === 'verified'),
              },
            });

            await tx.customerProfile.create({
              data: {
                user_id: newUser.id,
                full_name: fullName,
              },
            });
            console.log(`Created user: ${email} (${clerkUser.id})`);
          }
        });

        totalSynced++;
      }

      offset += clerkUsers.length;
      if (clerkUsers.length < limit) {
        hasMore = false;
      }
    }

    console.log(`--- Sync Complete! Total users processed: ${totalSynced} ---`);
  } catch (error: any) {
    console.error('Sync failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerk();
