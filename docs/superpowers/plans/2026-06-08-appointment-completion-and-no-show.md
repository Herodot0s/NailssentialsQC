# Appointment Completion Actual Time & No-Show Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overwrite appointment items' `end_time` with the actual completion time when completed, and allow staff and managers to mark appointments as a "no-show" starting on or after the scheduled date.

**Architecture:** 
1. Modify the completion controller to format current system time and save it as `end_time` on appointment items.
2. Add a new `no-show` controller action, register the `PATCH /api/appointments/:id/no-show` endpoint, write comprehensive mock tests for this endpoint, and log the action to `SystemLog`.
3. Add API client and Staff Dashboard UI updates to show the "Mark No-Show" button under correct constraints (date today/past and status pending/confirmed) with a confirmation dialog.

**Tech Stack:** TypeScript, Node.js, Express, Prisma ORM, React (Vite), Tailwind CSS, Jest

---

### Task 1: Overwrite End Time on Appointment Completion

**Files:**
- Modify: `backend/src/controllers/appointmentCompletion.ts`
- Test: `backend/src/__tests__/appointments.test.ts`

- [ ] **Step 1: Write a test checking that completion sets the actual end time**
  Add a new test inside the `describe('completeAppointment')` block in `backend/src/__tests__/appointments.test.ts`:
  ```typescript
  it('should overwrite appointmentItem end_time with the current system time in HH:mm format', async () => {
    const mockAppt = {
      id: 502,
      status: 'pending',
      customer_id: 101,
      customer: { user_id: 1 },
      items: [
        {
          id: 602,
          price_at_booking: 500,
          staff_id: 201,
          service_id: 1,
          staff: { user_id: 2, specializations: 'Nails' },
          service: {
            category: { name: 'Nails' },
          },
        },
      ],
    };

    const mockReq = {
      params: { id: '502' },
      body: {
        paymentMethod: 'cash',
        servicePhotoUrl: 'http://example.com/photo.jpg',
      },
    } as unknown as AuthRequest;

    prismaMock.appointment.findUnique.mockResolvedValue(mockAppt as any);
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 60000 } } as any);
    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
    prismaMock.transaction.count.mockResolvedValue(10);
    prismaMock.transaction.create.mockResolvedValue({ id: 702 } as any);
    prismaMock.commission.create.mockResolvedValue({ id: 802 } as any);

    await appointmentCompletion.completeAppointment(mockReq, mockRes as Response);

    expect(prismaMock.appointmentItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { appointment_id: 502 },
        data: expect.objectContaining({
          status: 'completed',
          end_time: expect.stringMatching(/^\d{2}:\d{2}$/),
        }),
      })
    );
  });
  ```

- [ ] **Step 2: Run tests to verify the test fails**
  Run: `npm test backend/src/__tests__/appointments.test.ts` (inside backend directory, or `npm run test` from root)
  Expected: FAIL (because `updateMany` for `appointmentItem` is not being called with `end_time`).

- [ ] **Step 3: Modify completion logic to overwrite `end_time`**
  Modify `backend/src/controllers/appointmentCompletion.ts` (around the `appointmentItem.updateMany` call):
  ```typescript
  // Also update all items to completed and set end_time to current time
  const nowTimeStr = format(new Date(), 'HH:mm');
  await tx.appointmentItem.updateMany({
    where: { appointment_id: parseInt(id as string) },
    data: { 
      status: 'completed',
      end_time: nowTimeStr,
    },
  });
  ```

- [ ] **Step 4: Run tests to verify it passes**
  Run: `npm test backend/src/__tests__/appointments.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run: `git commit -am "feat: overwrite end_time with actual completion time on service completion"`

---

### Task 2: Backend Route and Controller for No-Show Handling

**Files:**
- Create/Modify: `backend/src/controllers/appointmentController.ts`
- Modify: `backend/src/routes/appointmentRoutes.ts`
- Test: `backend/src/__tests__/appointments.test.ts`

- [ ] **Step 1: Write tests for markAppointmentNoShow**
  Add a `describe('markAppointmentNoShow')` block in `backend/src/__tests__/appointments.test.ts`:
  ```typescript
  describe('markAppointmentNoShow', () => {
    it('should successfully mark appointment and items as no_show and log it', async () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const mockAppt = {
        id: 901,
        status: 'pending',
        appointment_date: todayStr,
      };

      const mockReq = {
        user: { sub: 2, role: 'staff' },
        validatedParams: { id: 901 },
      } as unknown as AuthRequest;

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppt as any);
      prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
      prismaMock.appointment.update.mockResolvedValue({ ...mockAppt, status: 'no_show' } as any);

      await appointmentController.markAppointmentNoShow(mockReq, mockRes as Response);

      expect(prismaMock.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 901 },
          data: { status: 'no_show' },
        })
      );
      expect(prismaMock.appointmentItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { appointment_id: 901 },
          data: { status: 'no_show' },
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should fail if appointment scheduled date is in the future', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
      
      const mockAppt = {
        id: 902,
        status: 'pending',
        appointment_date: tomorrowStr,
      };

      const mockReq = {
        user: { sub: 2, role: 'staff' },
        validatedParams: { id: 902 },
      } as unknown as AuthRequest;

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppt as any);

      await appointmentController.markAppointmentNoShow(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Cannot mark future appointments as No-Show',
          }),
        })
      );
    });
  });
  ```

- [ ] **Step 2: Run tests to verify the tests fail**
  Run: `npm test backend/src/__tests__/appointments.test.ts`
  Expected: FAIL (because `markAppointmentNoShow` does not exist on `appointmentController`).

- [ ] **Step 3: Implement `markAppointmentNoShow` in backend controller**
  Add the following controller function to `backend/src/controllers/appointmentController.ts`:
  ```typescript
  export const markAppointmentNoShow = async (req: AuthRequest, res: Response) => {
    const id = req.validatedParams?.id;
    const userRole = req.user?.role;
    const userId = req.user?.sub;

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: Number(id) },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found' },
        });
      }

      if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Only pending or confirmed appointments can be marked as No-Show',
          },
        });
      }

      // Check if scheduled date is strictly in the future compared to today
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const scheduledDateStr = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');

      if (scheduledDateStr > todayStr) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot mark future appointments as No-Show',
          },
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: { id: Number(id) },
          data: { status: 'no_show' },
        });

        await tx.appointmentItem.updateMany({
          where: { appointment_id: Number(id) },
          data: { status: 'no_show' },
        });

        await tx.systemLog.create({
          data: {
            user_id: userId ? Number(userId) : null,
            action: 'MARK_NO_SHOW',
            entity_type: 'appointment',
            entity_id: Number(id),
            details: JSON.stringify({ markedBy: userRole }),
          },
        });
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Appointment marked as No-Show successfully' },
      });
    } catch (error: any) {
      console.error('Error marking appointment as no-show:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: error.message },
      });
    }
  };
  ```
  Ensure it is exported.

- [ ] **Step 4: Register route in `backend/src/routes/appointmentRoutes.ts`**
  Import `markAppointmentNoShow` from controller and add the route:
  ```typescript
  router.patch(
    '/:id/no-show',
    authenticateToken,
    authorizeRoles('staff', 'manager'),
    validateIdParam,
    markAppointmentNoShow
  );
  ```

- [ ] **Step 5: Run tests to verify they pass**
  Run: `npm test backend/src/__tests__/appointments.test.ts`
  Expected: PASS

- [ ] **Step 6: Commit**
  Run: `git commit -am "feat: add no-show backend controller and PATCH /api/appointments/:id/no-show route"`

---

### Task 3: Add No-Show Endpoint to Frontend API Client

**Files:**
- Modify: `frontend/src/api/apiClient.ts`

- [ ] **Step 1: Implement `markAppointmentNoShow` call**
  Open `frontend/src/api/apiClient.ts` and add the method:
  ```typescript
  export const markAppointmentNoShow = (id: number) => {
    return apiClient.patch(`/appointments/${id}/no-show`);
  };
  ```
  Ensure it is exported in the top-level list of exports if necessary.

- [ ] **Step 2: Commit**
  Run: `git commit -am "feat: add markAppointmentNoShow method to API client"`

---

### Task 4: Frontend Staff Dashboard UI Update

**Files:**
- Modify: `frontend/src/pages/StaffDashboard.tsx`

- [ ] **Step 1: Import API client method and Dialog components**
  Make sure `markAppointmentNoShow` is imported in `frontend/src/pages/StaffDashboard.tsx`.
  Add a state variable to track the appointment to mark as no-show:
  ```typescript
  const [noShowApptId, setNoShowApptId] = useState<number | null>(null);
  ```

- [ ] **Step 2: Implement no-show button and modal flow in UI**
  Add the "Mark No-Show" button next to "Complete Service" button in `StaffDashboard.tsx` (around lines 650-670 and in other places where actions are listed).
  ```tsx
  {['pending', 'confirmed'].includes(item.status) && (
    <Button
      onClick={() => setNoShowApptId(apt.id)}
      size="sm"
      variant="outline"
      className="rounded-md h-9 text-[12px] font-bold uppercase px-4 border-amber-600 text-amber-600 hover:bg-amber-50 transition-all shadow-none"
    >
      Mark No-Show
    </Button>
  )}
  ```
  And render a Dialog overlay in the component return:
  ```tsx
  <Dialog open={noShowApptId !== null} onOpenChange={(open) => !open && setNoShowApptId(null)}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogTitle>Confirm No-Show</DialogTitle>
      <DialogDescription className="py-4">
        Are you sure you want to mark this appointment as a No-Show? This action will cancel the scheduled items and log the event.
      </DialogDescription>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setNoShowApptId(null)}>
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (noShowApptId) {
              try {
                await markAppointmentNoShow(noShowApptId);
                setNoShowApptId(null);
                setStatusModal({
                  open: true,
                  type: 'success',
                  title: 'No-Show Logged',
                  description: 'Appointment has been marked as a no-show.',
                });
                fetchData(); // Refresh the list
              } catch (err: any) {
                setNoShowApptId(null);
                setStatusModal({
                  open: true,
                  type: 'error',
                  title: 'Operation Failed',
                  description: err.response?.data?.error?.message || 'Failed to update appointment.',
                });
              }
            }
          }}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

- [ ] **Step 3: Verify visually in browser and compile successfully**
  Run: `npm run build` or equivalent in frontend to check for compilation issues.

- [ ] **Step 4: Commit**
  Run: `git commit -am "feat: add Mark No-Show button and confirmation dialog on Staff Dashboard"`
