import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiHelpers';

/**
 * Handle Clerk Webhooks for user synchronization
 * POST /api/v1/auth/webhooks/clerk
 */
export const handleClerkWebhook = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return sendError(res, 'INTERNAL_SERVER_ERROR', 'Webhook configuration missing', 500);
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body
  const payload = JSON.stringify(req.body);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Get the type and data
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType} for user ${id}`);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { email_addresses, primary_email_address_id, first_name, last_name, public_metadata } = evt.data;
      
      const email = email_addresses.find((e: any) => e.id === primary_email_address_id)?.email_address 
                 || email_addresses[0]?.email_address;
      
      if (!email) return res.status(200).json({ success: true, message: 'No email, skipping' });

      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User';
      let role = (public_metadata?.role as string) || 'customer';

      // If user was just created and doesn't have a role in Clerk yet, set it to 'customer'
      if (eventType === 'user.created' && !public_metadata?.role) {
        console.log(`Setting default role 'customer' for user ${id} in Clerk metadata`);
        try {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              role: 'customer'
            }
          });
          role = 'customer';
        } catch (clerkError) {
          console.error(`Failed to update Clerk metadata for user ${id}:`, clerkError);
          // Continue with local sync even if Clerk update fails
        }
      }

      await prisma.$transaction(async (tx) => {
        // Upsert user
        const user = await tx.user.upsert({
          where: { clerk_id: id },
          update: {
            email,
            role: role, 
          },
          create: {
            clerk_id: id,
            email,
            username: email,
            role: role,
          },
        });

        // Upsert profile based on role
        if (role === 'customer') {
          await tx.customerProfile.upsert({
            where: { user_id: user.id },
            update: { full_name: fullName },
            create: {
              user_id: user.id,
              full_name: fullName,
            },
          });
        } else {
          // manager or staff
          await tx.staffProfile.upsert({
            where: { user_id: user.id },
            update: { full_name: fullName },
            create: {
              user_id: user.id,
              full_name: fullName,
            },
          });
        }
      });
    }

    if (eventType === 'user.deleted') {
      await prisma.user.update({
        where: { clerk_id: id },
        data: { is_active: false },
      });
    }

    return sendSuccess(res, { message: 'Webhook processed' }, 200);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
  }
};
