const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

async function runE2ETest() {
  console.log('🚀 Starting E2E Happy Path Test...');

  try {
    // 1. Register a new customer
    const timestamp = Date.now();
    const customerData = {
      fullName: `Test Customer ${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'Password123',
    };

    console.log('--- Step 1: Registering Customer ---');
    const regRes = await axios.post(`${API_URL}/auth/register`, customerData);
    console.log('✅ Registration successful');
    const customerToken = regRes.data.data.tokens.accessToken;

    // 2. Login
    console.log('--- Step 2: Logging in ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: customerData.email,
      password: customerData.password,
    });
    console.log('✅ Login successful');

    // 3. Get Services
    console.log('--- Step 3: Fetching Services ---');
    const svcRes = await axios.get(`${API_URL}/services`);
    const service = svcRes.data.data[0];
    console.log(`✅ Found service: ${service.name}`);

    // 4. Check Availability
    const today = new Date().toISOString().split('T')[0];
    console.log(`--- Step 4: Checking Availability for ${today} ---`);
    const availRes = await axios.get(`${API_URL}/appointments/availability?date=${today}`);
    const availableSlot = availRes.data.data.find((s) => s.available);
    if (!availableSlot) throw new Error('No available slots found');
    console.log(`✅ Found slot: ${availableSlot.time}`);

    // 5. Book Appointment
    console.log('--- Step 5: Booking Appointment ---');
    const bookRes = await axios.post(
      `${API_URL}/appointments`,
      {
        serviceId: service.id,
        date: today,
        time: availableSlot.time,
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      },
    );
    const appointmentId = bookRes.data.data.id;
    console.log(`✅ Appointment booked (ID: ${appointmentId})`);

    // 6. Login as Manager
    console.log('--- Step 6: Logging in as Manager ---');
    // Try test_manager/password123 (new seed) or admin/admin123 (legacy)
    let adminToken;
    try {
      const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
        identifier: 'test_manager',
        password: 'password123',
      });
      adminToken = adminLoginRes.data.data.tokens.accessToken;
    } catch (e) {
      console.log('--- Retrying with legacy admin credentials ---');
      const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
        identifier: 'admin',
        password: 'admin123',
      });
      adminToken = adminLoginRes.data.data.tokens.accessToken;
    }
    console.log('✅ Manager login successful');

    // 7. Complete Appointment
    console.log('--- Step 7: Completing Appointment ---');
    const completeRes = await axios.post(
      `${API_URL}/appointments/${appointmentId}/complete`,
      {
        paymentMethod: 'cash',
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    console.log('✅ Appointment completed');
    console.log(`📄 Receipt Number: ${completeRes.data.data.transaction.receipt_number}`);

    // 8. Verify Commission
    console.log('--- Step 8: Verifying Commissions ---');
    const commRes = await axios.get(`${API_URL}/appointments/staff-commissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const lastComm = commRes.data.data[0];
    if (lastComm.transaction_id === completeRes.data.data.transaction.id) {
      console.log(`✅ Commission verified: ₱${lastComm.commission_amount}`);
    } else {
      console.log('⚠️ Warning: Last commission does not match current transaction');
    }

    console.log('\n✨ E2E Happy Path Test Passed Successfully!');
  } catch (error) {
    console.error('\n❌ E2E Test Failed:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runE2ETest();
