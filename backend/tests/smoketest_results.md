PS C:\Users\Administrator\Desktop\nailssentialsqc-system\backend> npm test

> backend@1.0.0 test
> jest --runInBand

(node:16228) Warning: Failed to load the ES module: C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\jest.config.ts. Make sure to set "type": "module" in the nearest package.json file or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ multiple files { path: ['.env.local', '.env'] }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌘ override existing { override: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌁ auth for agents [www.vestauth.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

 FAIL  tests/integration/appointments.test.ts (20.274 s)
  Appointment Integration Tests
    Task 1: Appointment Creation and Availability Tests
      POST /api/v1/appointments
        × should successfully create an appointment as a customer (5667 ms)
        × should successfully create a walk-in appointment as a manager (3011 ms)
        × should fail validation for invalid dates (1586 ms)
      GET /api/v1/appointments/availability
        × should return availability slots (1611 ms)
        × should mark slot as unavailable when staff is booked (1638 ms)
    Task 2: Appointment Completion and Commission Tests
      × should successfully complete an appointment and create transaction/commissions (1641 ms)
      × should calculate higher commission rate when specialty quota is met (1678 ms)
      × should rollback transaction if completion fails (e.g. invalid data) (1659 ms)

  ● Appointment Integration Tests › Task 1: Appointment Creation and Availability Tests › POST /api/v1/appointments › should successfully create an appointment as a customer

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 400

      112 |           .send(payload);
      113 |
    > 114 |         expect(response.status).toBe(201);
          |                                 ^
      115 |         expect(response.body.success).toBe(true);
      116 |         expect(response.body.data.customer_id).toBe(customerId);
      117 |         

      at Object.<anonymous> (tests/integration/appointments.test.ts:114:33)

  ● Appointment Integration Tests › Task 1: Appointment Creation and Availability Tests › POST /api/v1/appointments › should successfully create a walk-in appointment as a manager

    TypeError: Cannot read properties of undefined (reading 'tokens')

      83 |       });
      84 |     
    > 85 |     return response.body.data.tokens.accessToken;
         |                               ^
      86 |   };
      87 |
      88 |   describe('Task 1: Appointment Creation and Availability Tests', () => {

      at getTokensForRole (tests/integration/appointments.test.ts:85:31)
      at async Object.<anonymous> (tests/integration/appointments.test.ts:91:22)

  ● Appointment Integration Tests › Task 1: Appointment Creation and Availability Tests › POST /api/v1/appointments › should fail validation for invalid dates

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  ● Appointment Integration Tests › Task 1: Appointment Creation and Availability Tests › GET /api/v1/appointments/availability › should return availability slots

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  ● Appointment Integration Tests › Task 1: Appointment Creation and Availability Tests › GET /api/v1/appointments/availability › should mark slot as unavailable when staff is booked

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  ● Appointment Integration Tests › Task 2: Appointment Completion and Commission Tests › should successfully complete an appointment and create transaction/commissions

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  ● Appointment Integration Tests › Task 2: Appointment Completion and Commission Tests › should calculate higher commission rate when specialty quota is met

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  ● Appointment Integration Tests › Task 2: Appointment Completion and Commission Tests › should rollback transaction if completion fails (e.g. invalid data)

    TypeError: Cannot read properties of undefined (reading 'tokens')

      44 |         phone: Math.random().toString().slice(2, 12),
      45 |       });
    > 46 |     customerToken = customerUserResponse.body.data.tokens.accessToken;
         |                                                    ^
      47 |     const customerProfile = await prisma.customerProfile.findFirst({
      48 |       where: { user: { email: email } }
      49 |     });

      at Object.<anonymous> (tests/integration/appointments.test.ts:46:52)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌘ override existing { override: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    prisma:error 
    Invalid `prisma.customerProfile.create()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\tests\integration\payroll.test.ts:84:53
    
      81   }
      82 });
      83 
    → 84 const customer = await prisma.customerProfile.create(
    Unique constraint failed on the fields: (`user_id`)

      at Object.Lc (node_modules/@prisma/client/runtime/library.js:21:432)

 FAIL  tests/integration/payroll.test.ts (10.944 s)
  Payroll Integration Tests
    POST /api/v1/payroll/generate
      × should generate payroll with correct calculations (4766 ms)
      × should reject overlapping payroll periods (1976 ms)
    Payroll Locking and Export
      × should lock a payroll period (1303 ms)
      × should fail to lock an already locked period (1293 ms)
      × should export payroll to Excel (1310 ms)

  ● Payroll Integration Tests › POST /api/v1/payroll/generate › should generate payroll with correct calculations

    PrismaClientKnownRequestError: 
    Invalid `prisma.customerProfile.create()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\tests\integration\payroll.test.ts:84:53

      81   }
      82 });
      83 
    → 84 const customer = await prisma.customerProfile.create(
    Unique constraint failed on the fields: (`user_id`)

      82 |       });
      83 |
    > 84 |       const customer = await prisma.customerProfile.create({
         |                        ^
      85 |         data: {
      86 |           user_id: (await prisma.user.findFirst({ where: { role: 'manager' } }))!.id, // Reuse manager user for simplicity
      87 |           full_name: 'Test Customer',

      at Un.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7447)
      at Un.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6771)
      at Un.request (node_modules/@prisma/client/runtime/library.js:121:6478)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9644)
      at async Object.<anonymous> (tests/integration/payroll.test.ts:84:24)

  ● Payroll Integration Tests › POST /api/v1/payroll/generate › should reject overlapping payroll periods

    TypeError: Cannot read properties of undefined (reading 'user')

      43 |       });
      44 |     
    > 45 |     const staffUserId = staffResponse.body.data.user.id;
         |                                                 ^
      46 |     await prisma.user.update({
      47 |       where: { id: staffUserId },
      48 |       data: { role: 'staff' }

      at Object.<anonymous> (tests/integration/payroll.test.ts:45:49)

  ● Payroll Integration Tests › Payroll Locking and Export › should lock a payroll period

    TypeError: Cannot read properties of undefined (reading 'user')

      21 |     // Manually promote to manager in DB
      22 |     await prisma.user.update({
    > 23 |       where: { id: managerResponse.body.data.user.id },
         |                                              ^
      24 |       data: { role: 'manager' }
      25 |     });
      26 |

      at Object.<anonymous> (tests/integration/payroll.test.ts:23:46)

  ● Payroll Integration Tests › Payroll Locking and Export › should fail to lock an already locked period

    TypeError: Cannot read properties of undefined (reading 'user')

      21 |     // Manually promote to manager in DB
      22 |     await prisma.user.update({
    > 23 |       where: { id: managerResponse.body.data.user.id },
         |                                              ^
      24 |       data: { role: 'manager' }
      25 |     });
      26 |

      at Object.<anonymous> (tests/integration/payroll.test.ts:23:46)

  ● Payroll Integration Tests › Payroll Locking and Export › should export payroll to Excel

    TypeError: Cannot read properties of undefined (reading 'user')

      21 |     // Manually promote to manager in DB
      22 |     await prisma.user.update({
    > 23 |       where: { id: managerResponse.body.data.user.id },
         |                                              ^
      24 |       data: { role: 'manager' }
      25 |     });
      26 |

      at Object.<anonymous> (tests/integration/payroll.test.ts:23:46)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ◈ encrypted .env [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    prisma:error 
    Invalid `prisma.systemLog.create()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\utils\systemLog.ts:26:28
    
      23 const ipAddress = (req.ip || req.socket.remoteAddress) as string | null;
      24 const userAgent = req.headers['user-agent'] as string | null;
      25 
    → 26 await prisma.systemLog.create(
    Foreign key constraint violated: `system_logs_user_id_fkey (index)`

      at Object.Lc (node_modules/@prisma/client/runtime/library.js:21:432)

  console.error
    [systemLog] Failed to record audit log for action: STAFF_CREATED PrismaClientKnownRequestError: 
    Invalid `prisma.systemLog.create()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\utils\systemLog.ts:26:28
    
      23 const ipAddress = (req.ip || req.socket.remoteAddress) as string | null;
      24 const userAgent = req.headers['user-agent'] as string | null;
      25 
    → 26 await prisma.systemLog.create(
    Foreign key constraint violated: `system_logs_user_id_fkey (index)`
        at Un.handleRequestError (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:7447)
        at Un.handleAndLogRequestError (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:6771)
        at Un.request (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:6478)
        at async l (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:130:9644)
        at async logSystemAction (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\utils\systemLog.ts:26:5)
        at async createStaff (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\staffController.ts:136:5) {
      code: 'P2003',
      clientVersion: '6.4.1',
      meta: {
        modelName: 'SystemLog',
        field_name: 'system_logs_user_id_fkey (index)'
      }
    }

      37 |   } catch (error) {
      38 |     // Log failure but do not rethrow - auditing should not crash the business logic
    > 39 |     console.error(`[systemLog] Failed to record audit log for action: ${action}`, error);
         |             ^
      40 |   }
      41 | };
      42 |

      at logSystemAction (src/utils/systemLog.ts:39:13)
      at async createStaff (src/controllers/staffController.ts:136:5)

 FAIL  tests/integration/staff_attendance.test.ts (20.561 s)
  Staff & Attendance Integration Tests
    Staff Management
      × should create a new staff member (Manager only) (2902 ms)
      × should list all staff (1382 ms)
      × should update staff information (1260 ms)
      √ should enforce RBAC: staff cannot create other staff (1276 ms)
      √ should get staff schedule (1334 ms)
    Attendance Tracking
      × should clock-in successfully (1374 ms)
      × should prevent double clock-in if already checked out (1399 ms)
      × should get attendance status (1304 ms)
      × should list all attendance records (Manager only) (1433 ms)
      × should fail to clock-out if not checked in (on a different day/new record) (1413 ms)
    Security & Edge Cases
      √ should not allow staff to view all attendance (1271 ms)
      × should not allow staff to update their own attendance record directly via PUT (1348 ms)

  ● Staff & Attendance Integration Tests › Staff Management › should create a new staff member (Manager only)

    expect(received).toBe(expected) // Object.is equality

    Expected: "New Staff Member"
    Received: undefined

      111 |       expect(response.status).toBe(201);
      112 |       expect(response.body.success).toBe(true);
    > 113 |       expect(response.body.data.fullName).toBe('New Staff Member');
          |                                           ^
      114 |       newStaffId = response.body.data.id;
      115 |     });
      116 |

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:113:43)

  ● Staff & Attendance Integration Tests › Staff Management › should list all staff

    expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      123 |       expect(response.body.success).toBe(true);
      124 |       expect(Array.isArray(response.body.data.items)).toBe(true);
    > 125 |       expect(response.body.data.items.length).toBeGreaterThan(0);
          |                                               ^
      126 |     });
      127 |
      128 |     it('should update staff information', async () => {

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:125:47)

  ● Staff & Attendance Integration Tests › Staff Management › should update staff information

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 400

      135 |         });
      136 |
    > 137 |       expect(response.status).toBe(200);
          |                               ^
      138 |       expect(response.body.success).toBe(true);
      139 |       expect(response.body.data.fullName).toBe('Updated Staff Name');
      140 |     });

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:137:31)

  ● Staff & Attendance Integration Tests › Attendance Tracking › should clock-in successfully

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      170 |         .set('Authorization', `Bearer ${staffToken}`);
      171 |
    > 172 |       expect(response.status).toBe(200);
          |                               ^
      173 |       expect(response.body.success).toBe(true);
      174 |       expect(response.body.data.check_in).toBeDefined();
      175 |     });

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:172:31)

  ● Staff & Attendance Integration Tests › Attendance Tracking › should prevent double clock-in if already checked out

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 404

      186 |         .set('Authorization', `Bearer ${staffToken}`);
      187 |
    > 188 |       expect(response.status).toBe(400);
          |                               ^
      189 |       expect(response.body.error.code).toBe('ALREADY_CHECKED_OUT');
      190 |     });
      191 |

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:188:31)

  ● Staff & Attendance Integration Tests › Attendance Tracking › should get attendance status

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      195 |         .set('Authorization', `Bearer ${staffToken}`);
      196 |
    > 197 |       expect(response.status).toBe(200);
          |                               ^
      198 |       expect(response.body.success).toBe(true);
      199 |       // Since we just checked out in the previous test
      200 |       expect(response.body.data.status.isCheckedIn).toBe(false);

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:197:31)

  ● Staff & Attendance Integration Tests › Attendance Tracking › should list all attendance records (Manager only)

    expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      211 |       expect(response.body.success).toBe(true);
      212 |       expect(Array.isArray(response.body.data)).toBe(true);
    > 213 |       expect(response.body.data.length).toBeGreaterThan(0);
          |                                         ^
      214 |     });
      215 |
      216 |     it('should fail to clock-out if not checked in (on a different day/new record)', async () => {

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:213:41)

  ● Staff & Attendance Integration Tests › Attendance Tracking › should fail to clock-out if not checked in (on a different day/new record)

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 404

      223 |             .set('Authorization', `Bearer ${staffToken}`);
      224 |
    > 225 |         expect(response.status).toBe(400);
          |                                 ^
      226 |         expect(response.body.error.code).toBe('NOT_CHECKED_IN');
      227 |     });
      228 |   });

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:225:33)

  ● Staff & Attendance Integration Tests › Security & Edge Cases › should not allow staff to update their own attendance record directly via PUT

    TypeError: Cannot read properties of undefined (reading 'id')

      243 |             .set('Authorization', `Bearer ${staffToken}`);
      244 |         
    > 245 |         const attendanceId = clockInResponse.body.data.id;
          |                                                        ^
      246 |
      247 |         const response = await request(app)
      248 |             .put(`/api/v1/attendance/${attendanceId}`)

      at Object.<anonymous> (tests/integration/staff_attendance.test.ts:245:56)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌁ auth for agents [www.vestauth.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

 FAIL  tests/integration/auth.test.ts (13.491 s)
  Auth Integration Tests
    POST /api/v1/auth/register
      √ should register a new user successfully (3233 ms)
      √ should fail registration with weak password (1310 ms)
      √ should fail with duplicate email (1721 ms)
    POST /api/v1/auth/login
      × should login successfully with valid credentials (1682 ms)
      × should fail login with wrong password (1292 ms)
    Advanced Auth & Security
      × should refresh tokens and rotate refresh token (1307 ms)
      × should invalidate refresh token on logout (1311 ms)
      × should enforce RBAC: customer cannot access manager routes (1318 ms)

  ● Auth Integration Tests › POST /api/v1/auth/login › should login successfully with valid credentials

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 429

      75 |         });
      76 |
    > 77 |       expect(response.status).toBe(200);
         |                               ^
      78 |       expect(response.body.success).toBe(true);
      79 |       expect(response.body.data.tokens.accessToken).toBeDefined();
      80 |       expect(response.body.data.tokens.refreshToken).toBeDefined();

      at Object.<anonymous> (tests/integration/auth.test.ts:77:31)

  ● Auth Integration Tests › POST /api/v1/auth/login › should fail login with wrong password

    expect(received).toBe(expected) // Object.is equality

    Expected: 401
    Received: 429

      89 |         });
      90 |
    > 91 |       expect(response.status).toBe(401);
         |                               ^
      92 |       expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      93 |     });
      94 |   });

      at Object.<anonymous> (tests/integration/auth.test.ts:91:31)

  ● Auth Integration Tests › Advanced Auth & Security › should refresh tokens and rotate refresh token

    TypeError: Cannot read properties of undefined (reading 'tokens')

      101 |         .post('/api/v1/auth/register')
      102 |         .send(registerPayload);
    > 103 |       tokens = response.body.data.tokens;
          |                                   ^
      104 |     });
      105 |
      106 |     it('should refresh tokens and rotate refresh token', async () => {

      at Object.<anonymous> (tests/integration/auth.test.ts:103:35)

  ● Auth Integration Tests › Advanced Auth & Security › should invalidate refresh token on logout

    TypeError: Cannot read properties of undefined (reading 'tokens')

      101 |         .post('/api/v1/auth/register')
      102 |         .send(registerPayload);
    > 103 |       tokens = response.body.data.tokens;
          |                                   ^
      104 |     });
      105 |
      106 |     it('should refresh tokens and rotate refresh token', async () => {

      at Object.<anonymous> (tests/integration/auth.test.ts:103:35)

  ● Auth Integration Tests › Advanced Auth & Security › should enforce RBAC: customer cannot access manager routes

    TypeError: Cannot read properties of undefined (reading 'tokens')

      101 |         .post('/api/v1/auth/register')
      102 |         .send(registerPayload);
    > 103 |       tokens = response.body.data.tokens;
          |                                   ^
      104 |     });
      105 |
      106 |     it('should refresh tokens and rotate refresh token', async () => {

      at Object.<anonymous> (tests/integration/auth.test.ts:103:35)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ enable debugging { debug: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    prisma:error 
    Invalid `prisma.serviceCategory.update()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\serviceController.ts:108:51
    
      105 try {
      106   const { id } = req.validatedParams ?? {};
      107   const { name, description, is_active, parentId } = req.body;
    → 108   const category = await prisma.serviceCategory.update(
    An operation failed because it depends on one or more records that were required but not found. Record to update not found.

      at Object.Lc (node_modules/@prisma/client/runtime/library.js:21:432)

  console.error
    Update category error: PrismaClientKnownRequestError: 
    Invalid `prisma.serviceCategory.update()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\serviceController.ts:108:51
    
      105 try {
      106   const { id } = req.validatedParams ?? {};
      107   const { name, description, is_active, parentId } = req.body;
    → 108   const category = await prisma.serviceCategory.update(
    An operation failed because it depends on one or more records that were required but not found. Record to update not found.
        at Un.handleRequestError (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:7447)
        at Un.handleAndLogRequestError (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:6771)
        at Un.request (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:121:6478)
        at async l (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\node_modules\@prisma\client\runtime\library.js:130:9644)
        at async updateCategory (C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\serviceController.ts:108:22) {
      code: 'P2025',
      clientVersion: '6.4.1',
      meta: {
        modelName: 'ServiceCategory',
        cause: 'Record to update not found.'
      }
    }

      117 |     return res.status(200).json({ success: true, data: category });
      118 |   } catch (error: unknown) {
    > 119 |     console.error('Update category error:', error);
          |             ^
      120 |     const message = error instanceof Error ? error.message : 'Failed to update category';
      121 |     return res.status(500).json({ success: false, message });
      122 |   }

      at updateCategory (src/controllers/serviceController.ts:119:13)

  console.log
    prisma:error 
    Invalid `prisma.service.create()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\serviceController.ts:139:42
    
      136   return res.status(400).json({ success: false, message: 'Duration must be greater than 0' });
      137 }
      138 
    → 139 const service = await prisma.service.create(
    Foreign key constraint violated: `services_category_id_fkey (index)`

      at Object.Lc (node_modules/@prisma/client/runtime/library.js:21:432)

  console.log
    prisma:error 
    Invalid `prisma.customerProfile.update()` invocation in
    C:\Users\Administrator\Desktop\nailssentialsqc-system\backend\src\controllers\customerController.ts:34:50
    
      31 }
      32 const { fullName, preferences, allergies, notes } = req.body;
      33 
    → 34 const profile = await prisma.customerProfile.update(
    An operation failed because it depends on one or more records that were required but not found. Record to update not found.

      at Object.Lc (node_modules/@prisma/client/runtime/library.js:21:432)

 FAIL  tests/integration/catalog_reports.test.ts (23.407 s)
  Catalog and Reports Integration Tests
    Service Category Management
      √ should create a new category (Manager only) (2403 ms)
      √ should fail to create category for non-manager (1322 ms)
      × should update a category (1436 ms)
      × should get all categories (Public) (1421 ms)
    Service Management
      × should create a new service (1457 ms)
      √ should fail to create service with negative price (1360 ms)
      × should update a service (1323 ms)
      × should get all services (Public) (1450 ms)
    Customer Profile Management
      × should get own profile (1433 ms)
      × should update own profile (1497 ms)
      × should allow staff to search customers (1413 ms)
    Reporting and Analytics
      √ should fail to access reports for customer (1353 ms)
      √ should get daily sales stats (Manager only) (1992 ms)
      √ should get historical analytics (1421 ms)

  ● Catalog and Reports Integration Tests › Service Category Management › should update a category

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 500

      87 |         });
      88 |
    > 89 |       expect(response.status).toBe(200);
         |                               ^
      90 |       expect(response.body.data.name).toBe('Nails Updated');
      91 |     });
      92 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:89:31)

  ● Catalog and Reports Integration Tests › Service Category Management › should get all categories (Public)

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

       95 |       expect(response.status).toBe(200);
       96 |       expect(Array.isArray(response.body.data)).toBe(true);
    >  97 |       expect(response.body.data.some((c: any) => c.id === categoryId)).toBe(true);
          |                                                                        ^
       98 |     });
       99 |   });
      100 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:97:72)

  ● Catalog and Reports Integration Tests › Service Management › should create a new service

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 500

      112 |         });
      113 |
    > 114 |       expect(response.status).toBe(201);
          |                               ^
      115 |       expect(response.body.data.name).toBe('Manicure');
      116 |       serviceId = response.body.data.id;
      117 |     });

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:114:31)

  ● Catalog and Reports Integration Tests › Service Management › should update a service

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 400

      141 |         });
      142 |
    > 143 |       expect(response.status).toBe(200);
          |                               ^
      144 |       expect(Number(response.body.data.price)).toBe(600);
      145 |       expect(response.body.data.is_popular).toBe(true);
      146 |     });

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:143:31)

  ● Catalog and Reports Integration Tests › Service Management › should get all services (Public)

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      150 |       expect(response.status).toBe(200);
      151 |       expect(Array.isArray(response.body.data)).toBe(true);
    > 152 |       expect(response.body.data.some((s: any) => s.id === serviceId)).toBe(true);
          |                                                                       ^
      153 |     });
      154 |   });
      155 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:152:71)

  ● Catalog and Reports Integration Tests › Customer Profile Management › should get own profile

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 404

      160 |         .set('Authorization', `Bearer ${customerToken}`);
      161 |
    > 162 |       expect(response.status).toBe(200);
          |                               ^
      163 |       expect(response.body.data.user_id).toBe(customerId);
      164 |     });
      165 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:162:31)

  ● Catalog and Reports Integration Tests › Customer Profile Management › should update own profile

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 500

      174 |         });
      175 |
    > 176 |       expect(response.status).toBe(200);
          |                               ^
      177 |       expect(response.body.data.full_name).toBe('Test Customer Updated');
      178 |     });
      179 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:176:31)

  ● Catalog and Reports Integration Tests › Customer Profile Management › should allow staff to search customers

    expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      186 |       expect(response.status).toBe(200);
      187 |       expect(Array.isArray(response.body.data)).toBe(true);
    > 188 |       expect(response.body.data.length).toBeGreaterThan(0);
          |                                         ^
      189 |     });
      190 |   });
      191 |

      at Object.<anonymous> (tests/integration/catalog_reports.test.ts:188:41)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ custom filepath { path: '/custom/path/.env' }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ override existing { override: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

 FAIL  tests/integration/misc_controllers.test.ts
  ● Test suite failed to run

    tests/integration/misc_controllers.test.ts:4:35 - error TS2307: Cannot find module '../helpers/auth' or its corresponding type declarations.

    4 import { generateAuthToken } from '../helpers/auth';
                                        ~~~~~~~~~~~~~~~~~
    tests/integration/misc_controllers.test.ts:16:9 - error TS2820: Type '"CUSTOMER"' is not assignable to type 'Role'. Did you mean '"customer"'?

    16         role: 'CUSTOMER'
               ~~~~

      node_modules/.prisma/client/index.d.ts:28942:5
        28942     role: $Enums.Role
                  ~~~~
        The expected type comes from property 'role' which is declared here on type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ enable debugging { debug: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

 PASS  tests/smoke.test.ts
  Smoke Test
    √ should pass (2280 ms)

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ enable debugging { debug: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌘ custom filepath { path: '/custom/path/.env' }

      at _log (node_modules/dotenv/lib/main.js:131:11)

 PASS  tests/systemLog.test.ts
  System Log
    ✎ todo should log administrative actions
    ✎ todo should log security-sensitive events
    ✎ todo should allow querying logs with filters

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ enable debugging { debug: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ◈ encrypted .env [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

 PASS  tests/staffController.test.ts
  Staff Controller
    ✎ todo should manage staff schedules
    ✎ todo should track staff attendance
    ✎ todo should handle staff leave requests

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ⌁ auth for agents [www.vestauth.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

 PASS  tests/payrollController.test.ts
  Payroll Controller
    ✎ todo should calculate commissions accurately
    ✎ todo should process monthly payroll
    ✎ todo should generate pay stubs

  console.log
    ◇ injected env (1) from ..\.env.test // tip: ⌘ multiple files { path: ['.env.local', '.env'] }

      at _log (node_modules/dotenv/lib/main.js:131:11)

  console.log
    ◇ injected env (0) from .env.test // tip: ◈ secrets for agents [www.dotenvx.com]

      at _log (node_modules/dotenv/lib/main.js:131:11)

 PASS  tests/reportController.test.ts
  Report Controller
    ✎ todo should generate daily sales reports
    ✎ todo should generate staff performance reports
    ✎ todo should generate inventory usage reports

Test Suites: 6 failed, 5 passed, 11 total
Tests:       35 failed, 12 todo, 13 passed, 60 total
Snapshots:   0 total
Time:        92.305 s, estimated 151 s
Ran all test suites.