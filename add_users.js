const { PrismaClient, Role } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Connecting to DB:', process.env.DATABASE_URL.split('@')[1]); // Log host only
    const hash = await bcrypt.hash('Password121212', 10);

    const users = [
      { username: 'test_customer', email: 'test_customer@example.com', role: 'customer', name: 'Test Customer' },
      { username: 'test_staff', email: 'test_staff@nails.com', role: 'staff', name: 'Test Staff' },
      { username: 'test_manager', email: 'test_manager@nails.com', role: 'manager', name: 'Test Manager' }
    ];

    for (const u of users) {
      console.log(`Creating/Updating user: ${u.username}`);
      const user = await prisma.user.upsert({
        where: { username: u.username },
        update: { password_hash: hash },
        create: {
          username: u.username,
          email: u.email,
          password_hash: hash,
          role: u.role
        }
      });

      if (u.role === 'customer') {
        await prisma.customerProfile.upsert({
          where: { user_id: user.id },
          update: { full_name: u.name },
          create: { user_id: user.id, full_name: u.name }
        });
      } else {
        await prisma.staffProfile.upsert({
          where: { user_id: user.id },
          update: { full_name: u.name },
          create: {
            user_id: user.id,
            full_name: u.name,
            specializations: u.role === 'manager' ? 'Management' : 'Nails',
            base_pay_per_week: u.role === 'manager' ? 5000 : 2500
          }
        });
      }
    }
    console.log('Done!');
  } catch (err) {
    console.error('Error adding users:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
