import prisma from './src/utils/prisma';

async function main() {
  try {
    const userCount = await prisma.user.count();
    const staffCount = await prisma.staffProfile.count();
    const customerCount = await prisma.customerProfile.count();
    console.log('--- DATABASE COUNT STATUS ---');
    console.log('User count:', userCount);
    console.log('Staff count:', staffCount);
    console.log('Customer count:', customerCount);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        is_active: true,
      },
    });
    console.log('All Users:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
