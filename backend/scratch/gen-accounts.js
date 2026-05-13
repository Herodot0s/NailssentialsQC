const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { role: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    let md = '# System Accounts\n\n';
    md += '| ID | Username | Role | Email | Active |\n';
    md += '|----|----------|------|-------|--------|\n';

    users.forEach((u) => {
      md += `| ${u.id} | ${u.username} | ${u.role} | ${u.email || '-'} | ${u.is_active ? '✅' : '❌'} |\n`;
    });

    const outputPath = path.join(process.cwd(), 'ACCOUNTS.md');
    fs.writeFileSync(outputPath, md);
    console.log(`Generated ACCOUNTS.md at ${outputPath}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
