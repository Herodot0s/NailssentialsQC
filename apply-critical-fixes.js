const fs = require('fs');
const path = require('path');

const backendSrc = path.join(__dirname, 'backend/src');

// Fix CR-05: Await sendAppointmentCompletion in appointmentCompletion.ts
const apptCompPath = path.join(backendSrc, 'controllers/appointmentCompletion.ts');
let apptComp = fs.readFileSync(apptCompPath, 'utf-8');

// Fix the IIFE to await sendAppointmentCompletion
const oldIIFE = `    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: appointment.customer_id },
          include: { user: true }
        });

        if (customer?.user.email && !appointment.is_walk_in) {
          sendAppointmentCompletion(customer.user.email, {
            customerName: customer.full_name,
            receiptNumber: receiptNumber,
            totalAmount: totalAmount.toFixed(2)
          });
        }
      } catch (err: unknown) {
        console.error('Post-completion notification error:', err);
      }
    })();`;

const newIIFE = `    (async () => {
      try {
        const customer = await prisma.customerProfile.findUnique({
          where: { id: appointment.customer_id },
          include: { user: true }
        });

        if (customer?.user.email && !appointment.is_walk_in) {
          await sendAppointmentCompletion(customer.user.email, {
            customerName: customer.full_name,
            receiptNumber: receiptNumber,
            totalAmount: totalAmount.toFixed(2)
          });
        }
      } catch (err: unknown) {
        console.error('Post-completion notification error:', err);
      }
    })();`;

if (apptComp.includes(oldIIFE)) {
  apptComp = apptComp.replace(oldIIFE, newIIFE);
  fs.writeFileSync(apptCompPath, apptComp, 'utf-8');
  console.log('CR-05 FIXED: awaited sendAppointmentCompletion in appointmentCompletion.ts');
} else {
  console.log('INFO: CR-05 pattern not found (may already be fixed)');
}

// Fix CR-07: Add deduction validation to payrollRoutes.ts
const payrollRoutesPath = path.join(backendSrc, 'routes/payrollRoutes.ts');
let payrollRoutes = fs.readFileSync(payrollRoutesPath, 'utf-8');

// Add addDeductionSchema import if not present
if (!payrollRoutes.includes('addDeductionSchema')) {
  // Add import after other imports
  payrollRoutes = payrollRoutes.replace(
    /(import \{ .* \} from '\.\.\/validators\/payrollSchemas';)/,
    '$1\nimport { addDeductionSchema } from \'../validators/payrollSchemas\';'
  );

  // Add validation to addDeduction route
  payrollRoutes = payrollRoutes.replace(
    /router\.post\('\/deductions',\s*authenticateToken,\s*authorizeRoles\('manager'\),\s*addDeduction\);/,
    "router.post('/deductions', authenticateToken, authorizeRoles('manager'), validateZod(addDeductionSchema), addDeduction);"
  );

  fs.writeFileSync(payrollRoutesPath, payrollRoutes, 'utf-8');
  console.log('CR-07 FIXED: added Zod validation for deduction creation');
} else {
  console.log('INFO: CR-07 addDeductionSchema already present');
}

// Fix CR-02: Only mark previous month's commissions as paid
const payrollCtrlPath = path.join(backendSrc, 'controllers/payrollController.ts');
let payrollCtrl = fs.readFileSync(payrollCtrlPath, 'utf-8');

const oldMarkPaid = `      // Mark this staff's previous month commissions as paid\n	      if (prevMonthCommissionsByStaff.get(staff.id)) {\n	        await prisma.commission.updateMany({\n	          where: {\n	            staff_id: staff.id,\n	            is_paid: false,\n	          },\n	          data: { is_paid: true },\n	        });\n	      }`;

const newMarkPaid = `      // Mark only previous month's commissions as paid\n	      const prevMonthCommissionIds = prevMonthCommissions\n	        .filter(c => c.staff_id === staff.id)\n	        .map(c => c.id);\n	      \n	      if (prevMonthCommissionIds.length > 0) {\n	        await prisma.commission.updateMany({\n	          where: {\n	            id: { in: prevMonthCommissionIds },\n	            is_paid: false,\n	          },\n	          data: { is_paid: true },\n	        });\n	      }`;

if (payrollCtrl.includes(oldMarkPaid)) {
  payrollCtrl = payrollCtrl.replace(oldMarkPaid, newMarkPaid);
  fs.writeFileSync(payrollCtrlPath, payrollCtrl, 'utf-8');
  console.log('CR-02 FIXED: only mark previous month commissions as paid');
} else {
  console.log('INFO: CR-02 pattern not found (may already be fixed)');
}

console.log('\nAll critical fixes applied. Please review and commit.');
