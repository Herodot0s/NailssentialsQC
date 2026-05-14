import { generateNextPeriod } from './src/controllers/payrollController';
import prisma from './src/utils/prisma';

async function run() {
  const latest = await prisma.payrollPeriod.findFirst({
    orderBy: { end_date: 'desc' }
  });

  console.log(`Latest Period Ends: ${latest?.end_date?.toISOString() || 'None'}`);

  const req = {
    user: { role: 'manager', sub: 1 },
    socket: { remoteAddress: '127.0.0.1' },
    body: latest ? {} : { start_date: '2026-05-01' }
  } as any;

  const res = {
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { 
      console.log(`\nGenerate Response [${this.statusCode}]:`, JSON.stringify(data, null, 2)); 
    }
  } as any;

  console.log("Generating next payroll period...");
  await generateNextPeriod(req, res);

  const next = await prisma.payrollPeriod.findFirst({
    orderBy: { end_date: 'desc' }
  });
  console.log(`\nNew Period: ${next?.start_date.toISOString()} to ${next?.end_date.toISOString()}`);
}

run().then(() => process.exit(0)).catch(console.error);
