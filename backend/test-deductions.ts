import { addDeduction, getDeductions } from './src/controllers/payrollController';
import prisma from './src/utils/prisma';

async function run() {
  const staff = await prisma.staffProfile.findFirst({});

  if (!staff) {
    console.log("No staff found to test.");
    return;
  }

  const reqAdd = {
    user: { role: 'manager', sub: 1 },
    body: {
      staff_id: staff.id.toString(),
      type: 'cash_advance',
      amount: 1000,
      notes: 'Testing UAT'
    }
  } as any;

  const res = {
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { 
      console.log(`\nAdd Response [${this.statusCode}]:`, JSON.stringify(data, null, 2)); 
    }
  } as any;

  console.log("Adding a deduction...");
  await addDeduction(reqAdd, res);

  const reqGet = {
    user: { role: 'manager', sub: 1 },
    query: {}
  } as any;

  const resGet = {
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { 
      console.log(`\nGet Response [${this.statusCode}]:`, JSON.stringify(data.data?.[0], null, 2)); 
    }
  } as any;

  console.log("\nFetching deductions...");
  await getDeductions(reqGet, resGet);
}

run().then(() => process.exit(0)).catch(console.error);
