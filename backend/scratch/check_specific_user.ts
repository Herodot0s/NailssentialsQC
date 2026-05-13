import prisma from '../src/utils/prisma';

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'lharericsabinorio147@gmail.com' },
          { clerk_id: 'user_3DfWCYgGIdvfbp108NNYryKNvhJ' }
        ]
      },
      include: {
        customer_profile: true
      }
    });

    if (user) {
      console.log('User found in database:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User NOT found in database.');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
