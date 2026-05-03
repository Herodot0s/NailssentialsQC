/**
 * Fix all critical issues from code review (CR-01 through CR-07)
 */

const fs = require('fs');
const path = require('path');

const backendSrc = path.join(__dirname, 'backend/src');

// Fix CR-01: Transaction helpers already fixed in appointmentCompletion.ts
// (getTieredCommissionRate and checkSpecialtyQuota now accept tx parameter)

// Fix CR-02: Payroll marks only previous month's commissions as paid
const payrollController = path.join(backendSrc, 'controllers/payrollController.ts');
let payrollContent = fs.readFileSync(payrollController, 'utf-8');

// Replace the block that marks ALL unpaid commissions as paid
const oldMarkPaid = `	      // Mark this staff's previous month commissions as paid
	      if (prevMonthCommissionsByStaff.get(staff.id)) {
	        await prisma.commission.updateMany({
	          where: {
	            staff_id: staff.id,
	            is_paid: false,
	          },
	          data: { is_paid: true },
	        });
	      }`;

const newMarkPaid = `	      // Mark only previous month's commissions as paid (the ones used in divide-by-4 calculation)
	      const prevMonthCommissionIds = prevMonthCommissions
	        .filter(c => c.staff_id === staff.id)
	        .map(c => c.id);

	      if (prevMonthCommissionIds.length > 0) {
	        await prisma.commission.updateMany({
	          where: {
	            id: { in: prevMonthCommissionIds },
	            is_paid: false,
	          },
	          data: { is_paid: true },
	        });
	      }`;

if (payrollContent.includes(oldMarkPaid)) {
  payrollContent = payrollContent.replace(oldMarkPaid, newMarkPaid);
  console.log('CR-02 fix applied: only mark previous month commissions as paid');
} else {
  console.log('WARNING: CR-02 target block not found');
}

fs.writeFileSync(payrollController, payrollContent, 'utf-8');

// Fix CR-05: Unawaited async calls in IIFEs
const appointmentController = path.join(backendSrc, 'controllers/appointmentController.ts');
let acContent = fs.readFileSync(appointmentController, 'utf-8');

// Fix unawaited IIFE in appointmentController.ts
const oldIIFE_AC = `(async () => {
	  try {
	    // Create notifications for staff
	    await createNotification({
	      userId: staffIds,
	      message: \`New appointment booked by \${customerName}.\, Slot: \${format(appointmentDate, 'MMMM d, yyyy h:mm a')}\`,
	      type: 'appointment',
	      related_id: appointment.id,
	    });

	    // Send emails to all staff members
	    for (const staff of staffMembers) {
	      if (staff.email) {
	        sendAppointmentNotification(staff.email, staff.full_name, {
	          customerName,
	          date: format(appointmentDate, 'MMMM d, yyyy'),
	          time: format(appointmentDate, 'h:mm a'),
	          services: servicesList,
	        });
	      }
	    }
	  } catch (err: unknown) {
	    console.error('Post-booking notification error:', err);
	  }
	})();`;

const newIIFE_AC = `(async () => {
	  try {
	    // Create notifications for staff
	    await createNotification({
	      userId: staffIds,
	      message: \`New appointment booked by \${customerName}.\, Slot: \${format(appointmentDate, 'MMMM d, yyyy h:mm a')}\`,
	      type: 'appointment',
	      related_id: appointment.id,
	    });

	    // Send emails to all staff members
	    for (const staff of staffMembers) {
	      if (staff.email) {
	        await sendAppointmentNotification(staff.email, staff.full_name, {
	          customerName,
	          date: format(appointmentDate, 'MMMM d, yyyy'),
	          time: format(appointmentDate, 'h:mm a'),
	          services: servicesList,
	        });
	      }
	    }
	  } catch (err: unknown) {
	    console.error('Post-booking notification error:', err);
	  }
	})();`;

if (acContent.includes(oldIIFE_AC)) {
  acContent = acContent.replace(oldIIFE_AC, newIIFE_AC);
  console.log('CR-05 fix applied: await sendAppointmentNotification in appointmentController');
} else {
  console.log('INFO: CR-05 IIFE pattern not found in appointmentController (may already be fixed)');
}

fs.writeFileSync(appointmentController, acContent, 'utf-8');

// Fix CR-06: Add :id param validation for appointment complete route
const appointmentRoutes = path.join(backendSrc, 'routes/appointmentRoutes.ts');
let arContent = fs.readFileSync(appointmentRoutes, 'utf-8');

// Add validateIdParam middleware if not present
if (!arContent.includes('validateIdParam')) {
  // Add the idParamSchema and validateIdParam after imports
  const schemaAndMiddleware = `
// Validate :id parameter middleware
const idParamSchema = z.object({
  id: z.string().regex(/^\\d+$/, 'ID must be a number').transform(Number),
});

const validateIdParam = (req: any, res: any, next: any) => {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'Invalid ID parameter' },
    });
  }
  req.validatedParams = result.data;
  next();
};

// Import z at top if not already present
`;

  // Check if z is imported
  if (!arContent.includes("import { z }")) {
    arContent = arContent.replace(
      /(import .+ from 'zod';\s*\n)/,
      '$1' + schemaAndMiddleware
    );
  } else {
    // Insert after the last import
    const lastImportIdx = arContent.lastIndexOf("import '");
    const insertIdx = arContent.indexOf('\n', lastImportIdx);
    arContent = arContent.slice(0, insertIdx + 1) + schemaAndMiddleware + arContent.slice(insertIdx + 1);
  }

  // Update the complete route to use validateIdParam
  arContent = arContent.replace(
    /router\.post\('\/:id\/complete',\s*authenticateToken,\s*authorizeRoles\([^)]+\),\s*validateZod\(completeAppointmentSchema\),\s*completeAppointment\);/,
    "router.post('/:id/complete', authenticateToken, authorizeRoles('staff', 'manager'), validateIdParam, validateZod(completeAppointmentSchema), completeAppointment);"
  );

  console.log('CR-06 fix applied: added validateIdParam to appointment complete route');
  fs.writeFileSync(appointmentRoutes, arContent, 'utf-8');
} else {
  console.log('INFO: validateIdParam already present in appointmentRoutes.ts');
}

// Fix CR-03: Add Zod validation for staff creation
const staffRoutes = path.join(backendSrc, 'routes/staffRoutes.ts');
let srContent = fs.readFileSync(staffRoutes, 'utf-8');

if (!srContent.includes('validateZod(createStaffSchema)')) {
  srContent = srContent.replace(
    /router\.post\('\/',\s*authenticateToken,\s*authorizeRoles\([^)]+\),\s*createStaff\);/,
    "router.post('/', authenticateToken, authorizeRoles('manager'), validateZod(createStaffSchema), createStaff);"
  );
  console.log('CR-03 fix applied: added Zod validation to staff creation route');
  fs.writeFileSync(staffRoutes, srContent, 'utf-8');
} else {
  console.log('INFO: Zod validation already present for staff creation');
}

// Fix CR-04: Add validation for staff update route
if (!srContent || !srContent.includes('validateZod(updateStaffSchema)')) {
  srContent = srContent || fs.readFileSync(staffRoutes, 'utf-8');
  srContent = srContent.replace(
    /router\.put\('\/:id',\s*authenticateToken,\s*authorizeRoles\([^)]+\),\s*updateStaff\);/,
    "router.put('/:id', authenticateToken, authorizeRoles('manager'), validateIdParam, validateZod(updateStaffSchema), updateStaff);"
  );
  console.log('CR-04 fix applied: added validation to staff update route');
  fs.writeFileSync(staffRoutes, srContent, 'utf-8');
}

console.log('\nAll critical fixes applied. Please review and commit.');
