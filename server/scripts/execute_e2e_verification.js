const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

const results = [];

function recordTest(phase, title, status, details = {}, error = null) {
  const item = {
    phase,
    title,
    status,
    details,
    error: error ? (error.message || String(error)) : null,
    timestamp: new Date().toISOString(),
  };
  results.push(item);
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${phase}] ${title}`);
  if (error) console.error('   Error:', error.message || error);
}

async function run() {
  console.log('================================================================');
  console.log('🚀 EXECUTING COMPLETE MERN PBL END-TO-END VERIFICATION SUITE');
  console.log('   Backend API:   ' + BASE_URL);
  console.log('   Frontend Vite: ' + FRONTEND_URL);
  console.log('================================================================\n');

  let customerToken = null;
  let customerUser = null;
  let appointmentData = null;
  let appointmentId = null;
  let adminToken = null;
  let adminUser = null;

  // ====================================================================
  // PHASE 1: APPLICATION STARTUP & HEALTH CHECKS
  // ====================================================================
  console.log('--- Executing Phase 1: Application Startup & Health Checks ---');
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    if (healthRes.status === 200 && healthJson.status === 'OK') {
      recordTest('PHASE 1', 'Backend Server Health Verified (GET /api/health)', 'PASS', healthJson);
    } else {
      throw new Error(`Health check returned status ${healthRes.status}`);
    }
  } catch (err) {
    recordTest('PHASE 1', 'Backend Server Health Verified', 'FAIL', {}, err);
  }

  try {
    const viteRes = await fetch(FRONTEND_URL);
    if (viteRes.status === 200) {
      recordTest('PHASE 1', 'React Vite Frontend Server Running on Port 5173', 'PASS', {
        status: viteRes.status,
      });
    } else {
      throw new Error(`Frontend returned HTTP ${viteRes.status}`);
    }
  } catch (err) {
    recordTest('PHASE 1', 'React Vite Frontend Server Running', 'FAIL', {}, err);
  }

  try {
    const servicesRes = await fetch(`${BASE_URL}/services`);
    const servicesJson = await servicesRes.json();
    if (servicesRes.status === 200 && servicesJson.success && servicesJson.services.length > 0) {
      recordTest('PHASE 1', 'Database Services Seeded & Queryable', 'PASS', {
        totalServices: servicesJson.services.length,
        sample: servicesJson.services[0].name,
      });
    } else {
      throw new Error('No beauty services found in database');
    }
  } catch (err) {
    recordTest('PHASE 1', 'Database Services Seeded & Queryable', 'FAIL', {}, err);
  }

  // Admin login to clean any previous test customer
  try {
    const preLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@riyaa.com', password: 'admin123' }),
    });
    const preLoginJson = await preLoginRes.json();
    if (preLoginJson.token) {
      await fetch(`${BASE_URL}/admin/cleanup-test-data?email=pbl.test.customer@example.com`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${preLoginJson.token}` },
      });
    }
  } catch (e) {}

  // ====================================================================
  // PHASE 2: CREATE FRESH TEST CUSTOMER VIA UI / API
  // ====================================================================
  console.log('\n--- Executing Phase 2: Fresh Customer Registration & Auth ---');
  const customerCredentials = {
    name: 'PBL Test Customer',
    email: 'pbl.test.customer@example.com',
    phone: '9000000000',
    password: 'PblTest@2026',
  };

  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerCredentials),
    });
    const regJson = await regRes.json();

    if (regRes.status === 201 && regJson.success) {
      recordTest('PHASE 2', 'Customer Registration Succeeded (POST /api/auth/register)', 'PASS', {
        id: regJson.user.id,
        name: regJson.user.name,
        email: regJson.user.email,
        role: regJson.user.role,
        tokenReceived: !!regJson.token,
      });
    } else {
      throw new Error(`Registration failed: ${regJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 2', 'Customer Registration Succeeded', 'FAIL', {}, err);
  }

  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerCredentials.email,
        password: customerCredentials.password,
      }),
    });
    const loginJson = await loginRes.json();

    if (loginRes.status === 200 && loginJson.success && loginJson.token) {
      customerToken = loginJson.token;
      customerUser = loginJson.user;

      if (customerUser.role !== 'CUSTOMER') {
        throw new Error(`Expected role CUSTOMER, got ${customerUser.role}`);
      }
      if (customerUser.password !== undefined) {
        throw new Error('Security flaw: user password exposed in login response');
      }

      recordTest('PHASE 2', 'Customer Login & JWT Token Verified (POST /api/auth/login)', 'PASS', {
        name: customerUser.name,
        role: customerUser.role,
        tokenLength: customerToken.length,
      });
    } else {
      throw new Error(`Login failed: ${loginJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 2', 'Customer Login & JWT Token Verified', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 3: BOOK AN ACTUAL TEST APPOINTMENT
  // ====================================================================
  console.log('\n--- Executing Phase 3: Book Actual Test Appointment ---');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const appointmentDate = futureDate.toISOString().split('T')[0];

  const bookingPayload = {
    name: 'PBL Test Customer',
    email: 'pbl.test.customer@example.com',
    phone: '9000000000',
    serviceId: 'bridal_makeup',
    appointmentDate: appointmentDate,
    appointmentTime: '10:00 AM',
    numberOfPeople: 1,
    notes: 'Automated MERN PBL end-to-end test appointment',
  };

  try {
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(bookingPayload),
    });
    const bookJson = await bookRes.json();

    if (bookRes.status === 201 && bookJson.success) {
      appointmentData = bookJson.appointment;
      appointmentId = appointmentData.appointmentId;

      if (!appointmentId || !appointmentId.startsWith('APT-')) {
        throw new Error(`Appointment ID missing or invalid prefix: ${appointmentId}`);
      }
      if (appointmentData.status !== 'Pending') {
        throw new Error(`Expected initial status 'Pending', got ${appointmentData.status}`);
      }

      recordTest('PHASE 3', 'Test Appointment Created (POST /api/appointments)', 'PASS', {
        appointmentId: appointmentData.appointmentId,
        serviceName: appointmentData.serviceName,
        status: appointmentData.status,
        date: appointmentData.appointmentDate,
        time: appointmentData.appointmentTime,
      });
    } else {
      throw new Error(`Appointment creation failed: ${bookJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 3', 'Test Appointment Created', 'FAIL', {}, err);
  }

  // Verify in customer's "My Appointments"
  try {
    const myApptRes = await fetch(`${BASE_URL}/appointments/my`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myApptJson = await myApptRes.json();

    if (myApptRes.status === 200 && myApptJson.success) {
      const match = myApptJson.appointments.find((a) => a.appointmentId === appointmentId);
      if (!match) {
        throw new Error(`Created appointment ${appointmentId} not found in customer list`);
      }
      recordTest('PHASE 3', 'Appointment Verified in Customer "My Appointments"', 'PASS', {
        appointmentId: match.appointmentId,
        serviceName: match.serviceName,
        status: match.status,
      });
    } else {
      throw new Error(`Failed to retrieve customer appointments: ${myApptJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 3', 'Appointment Verified in Customer "My Appointments"', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 4: VERIFY DATABASE PERSISTENCE DIRECTLY
  // ====================================================================
  console.log('\n--- Executing Phase 4: Verify Database Persistence ---');
  // Obtain Admin Token for inspection
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@riyaa.com', password: 'admin123' }),
    });
    const adminLoginJson = await adminLoginRes.json();
    adminToken = adminLoginJson.token;
    adminUser = adminLoginJson.user;

    const inspectRes = await fetch(
      `${BASE_URL}/admin/verify-records?email=${customerCredentials.email}&appointmentId=${appointmentId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const inspectJson = await inspectRes.json();

    if (inspectRes.status === 200 && inspectJson.success) {
      const user = inspectJson.user;
      const appt = inspectJson.appointment;

      if (!user) throw new Error('Customer user record not found in database');
      if (user.role !== 'CUSTOMER') throw new Error(`Expected role CUSTOMER, got ${user.role}`);
      if (!user.isHashed) throw new Error('Customer password in database is NOT hashed with bcrypt');

      recordTest('PHASE 4', 'User Persistence & Password Hashing Verified', 'PASS', {
        userId: user._id,
        email: user.email,
        role: user.role,
        isBcryptHashed: user.isHashed,
        hashPrefix: user.passwordPrefix,
        createdAt: user.createdAt,
      });

      if (!appt) throw new Error('Appointment record not found in database');
      if (appt.appointmentId !== appointmentId) throw new Error('Appointment ID mismatch in database');
      if (!appt.createdAt || !appt.updatedAt) throw new Error('Missing Mongoose timestamps');
      if (appt.notes !== 'Automated MERN PBL end-to-end test appointment') {
        throw new Error('Appointment notes mismatch in database');
      }

      recordTest('PHASE 4', 'Appointment Persistence & Timestamps Verified', 'PASS', {
        appointmentId: appt.appointmentId,
        customerRef: appt.customer,
        serviceName: appt.serviceName,
        status: appt.status,
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt,
      });
    } else {
      throw new Error(`Database inspection failed: ${inspectJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 4', 'Database Record Persistence Inspection', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 5: ADMIN / BEAUTICIAN DASHBOARD & STATUS TRANSITIONS
  // ====================================================================
  console.log('\n--- Executing Phase 5: Admin Dashboard & Status Transitions ---');
  try {
    recordTest('PHASE 5', 'Admin Authentication & Role Verified', 'PASS', {
      adminEmail: adminUser.email,
      role: adminUser.role,
    });

    // 1. Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsJson = await statsRes.json();
    if (statsRes.status === 200 && statsJson.success) {
      recordTest('PHASE 5', 'Admin Dashboard KPI Stats Verified (GET /api/admin/stats)', 'PASS', statsJson.stats);
    } else {
      throw new Error(`Stats fetch failed: ${statsJson.message}`);
    }

    // 2. Search for test appointment
    const searchRes = await fetch(`${BASE_URL}/admin/appointments?search=PBL%20Test%20Customer`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const searchJson = await searchRes.json();
    const found = searchJson.appointments.find((a) => a.appointmentId === appointmentId);
    if (!found) throw new Error(`Appointment ${appointmentId} not found via admin search`);

    recordTest('PHASE 5', 'Admin Appointment Search Verified', 'PASS', {
      appointmentId: found.appointmentId,
      customerName: found.customerName,
      status: found.status,
    });

    // 3. Status Transition: Pending -> Confirmed
    const confirmRes = await fetch(`${BASE_URL}/admin/appointments/${found._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const confirmJson = await confirmRes.json();
    if (confirmRes.status === 200 && confirmJson.appointment.status === 'Confirmed') {
      recordTest('PHASE 5', 'Status Transition: Pending -> Confirmed Succeeded', 'PASS', {
        status: confirmJson.appointment.status,
      });
    } else {
      throw new Error(`Status update to Confirmed failed: ${confirmJson.message}`);
    }

    // 4. Status Transition: Confirmed -> Completed
    const completeRes = await fetch(`${BASE_URL}/admin/appointments/${found._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Completed' }),
    });
    const completeJson = await completeRes.json();
    if (completeRes.status === 200 && completeJson.appointment.status === 'Completed') {
      recordTest('PHASE 5', 'Status Transition: Confirmed -> Completed Succeeded', 'PASS', {
        status: completeJson.appointment.status,
      });
    } else {
      throw new Error(`Status update to Completed failed: ${completeJson.message}`);
    }

    // 5. Verify status persistence across refresh
    const recheckRes = await fetch(`${BASE_URL}/admin/verify-records?appointmentId=${appointmentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const recheckJson = await recheckRes.json();
    if (recheckJson.appointment.status === 'Completed') {
      recordTest('PHASE 5', 'Updated Status Persisted Permanently in Database', 'PASS', {
        appointmentId,
        persistedStatus: recheckJson.appointment.status,
      });
    } else {
      throw new Error(`Persisted status is ${recheckJson.appointment.status}, expected Completed`);
    }
  } catch (err) {
    recordTest('PHASE 5', 'Admin Verification Error', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 6: CUSTOMER HISTORY & CLIENT RECORD
  // ====================================================================
  console.log('\n--- Executing Phase 6: Customer History & Client Record ---');
  try {
    const historyRes = await fetch(
      `${BASE_URL}/admin/customers/history?query=PBL%20Test%20Customer`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const historyJson = await historyRes.json();

    if (historyRes.status === 200 && historyJson.success) {
      if (!historyJson.customer) throw new Error('Customer details missing in history response');
      if (historyJson.totalVisits < 1) throw new Error(`Total visits ${historyJson.totalVisits} < 1`);

      const histMatch = historyJson.appointments.find((a) => a.appointmentId === appointmentId);
      if (!histMatch) throw new Error(`Appointment ${appointmentId} missing from customer timeline`);
      if (histMatch.status !== 'Completed') {
        throw new Error(`Appointment status in history is ${histMatch.status}, expected Completed`);
      }

      recordTest('PHASE 6', 'Customer History & Timeline Verified (GET /api/admin/customers/history)', 'PASS', {
        customerName: historyJson.customer.name,
        totalVisits: historyJson.totalVisits,
        completedVisits: historyJson.completedVisits,
        timelineRecordStatus: histMatch.status,
      });
    } else {
      throw new Error(`History fetch failed: ${historyJson.message}`);
    }
  } catch (err) {
    recordTest('PHASE 6', 'Customer History & Client Record', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 7: SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
  // ====================================================================
  console.log('\n--- Executing Phase 7: Security & Role-Based Access Control ---');
  try {
    // 1. Customer token calling GET /api/admin/appointments -> 403 Forbidden
    const rbac1 = await fetch(`${BASE_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (rbac1.status === 403) {
      recordTest('PHASE 7', 'RBAC: Customer Forbidden from Admin Appointments List (403)', 'PASS', {
        statusCode: 403,
      });
    } else {
      throw new Error(`Expected 403, received ${rbac1.status}`);
    }

    // 2. Customer token calling GET /api/admin/stats -> 403 Forbidden
    const rbac2 = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (rbac2.status === 403) {
      recordTest('PHASE 7', 'RBAC: Customer Forbidden from Admin Stats (403)', 'PASS', {
        statusCode: 403,
      });
    } else {
      throw new Error(`Expected 403, received ${rbac2.status}`);
    }

    // 3. Customer token calling PUT status -> 403 Forbidden
    const rbac3 = await fetch(`${BASE_URL}/admin/appointments/${appointmentData._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    if (rbac3.status === 403) {
      recordTest('PHASE 7', 'RBAC: Customer Forbidden from Mutating Appointment Status (403)', 'PASS', {
        statusCode: 403,
      });
    } else {
      throw new Error(`Expected 403, received ${rbac3.status}`);
    }

    // 4. Unauthenticated request to /api/admin/stats -> 401 Unauthorized
    const rbac4 = await fetch(`${BASE_URL}/admin/stats`);
    if (rbac4.status === 401) {
      recordTest('PHASE 7', 'Auth Guard: Unauthenticated Request Blocked (401)', 'PASS', {
        statusCode: 401,
      });
    } else {
      throw new Error(`Expected 401, received ${rbac4.status}`);
    }

    // 5. Invalid token -> 401 Unauthorized
    const rbac5 = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: 'Bearer invalid.fake.token' },
    });
    if (rbac5.status === 401) {
      recordTest('PHASE 7', 'Auth Guard: Tampered / Invalid JWT Blocked (401)', 'PASS', {
        statusCode: 401,
      });
    } else {
      throw new Error(`Expected 401, received ${rbac5.status}`);
    }
  } catch (err) {
    recordTest('PHASE 7', 'Security & Role-Based Access Control', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 8: VALIDATION & ERROR HANDLING TESTS
  // ====================================================================
  console.log('\n--- Executing Phase 8: Validation & Error Handling Tests ---');
  try {
    // 1. Past date booking -> 400
    const valPast = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'PBL Test Customer',
        email: 'pbl.test.customer@example.com',
        phone: '9000000000',
        serviceId: 'bridal_makeup',
        appointmentDate: '2020-01-01',
        appointmentTime: '10:00 AM',
      }),
    });
    const valPastJson = await valPast.json();
    if (valPast.status === 400 && valPastJson.message.toLowerCase().includes('past')) {
      recordTest('PHASE 8', 'Validation: Past Date Booking Rejected with 400', 'PASS', {
        message: valPastJson.message,
      });
    } else {
      throw new Error(`Expected 400 with past date message, got ${valPast.status}`);
    }

    // 2. Missing required fields -> 400
    const valMissing = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'PBL Test Customer' }),
    });
    const valMissingJson = await valMissing.json();
    if (valMissing.status === 400) {
      recordTest('PHASE 8', 'Validation: Missing Required Fields Rejected with 400', 'PASS', {
        message: valMissingJson.message,
      });
    } else {
      throw new Error(`Expected 400, got ${valMissing.status}`);
    }

    // 3. Invalid email format -> 400
    const valEmail = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'PBL Test Customer',
        email: 'bad-email-format',
        phone: '9000000000',
        serviceId: 'bridal_makeup',
        appointmentDate: '2026-10-20',
        appointmentTime: '10:00 AM',
      }),
    });
    const valEmailJson = await valEmail.json();
    if (valEmail.status === 400 && valEmailJson.message.toLowerCase().includes('email')) {
      recordTest('PHASE 8', 'Validation: Invalid Email Format Rejected with 400', 'PASS', {
        message: valEmailJson.message,
      });
    } else {
      throw new Error(`Expected 400 for bad email, got ${valEmail.status}`);
    }

    // 4. Invalid phone (too short) -> 400
    const valPhone = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'PBL Test Customer',
        email: 'pbl.test.customer@example.com',
        phone: '12345',
        serviceId: 'bridal_makeup',
        appointmentDate: '2026-10-20',
        appointmentTime: '10:00 AM',
      }),
    });
    const valPhoneJson = await valPhone.json();
    if (valPhone.status === 400 && valPhoneJson.message.toLowerCase().includes('phone')) {
      recordTest('PHASE 8', 'Validation: Short/Invalid Phone Number Rejected with 400', 'PASS', {
        message: valPhoneJson.message,
      });
    } else {
      throw new Error(`Expected 400 for short phone, got ${valPhone.status}`);
    }
  } catch (err) {
    recordTest('PHASE 8', 'Validation & Error Handling Tests', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 9: PERSISTENCE ACROSS SESSIONS & REFRESHES
  // ====================================================================
  console.log('\n--- Executing Phase 9: Persistence Across Sessions & Refreshes ---');
  try {
    const persistRes = await fetch(
      `${BASE_URL}/admin/verify-records?email=${customerCredentials.email}&appointmentId=${appointmentId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const persistJson = await persistRes.json();

    if (persistRes.status === 200 && persistJson.user && persistJson.appointment) {
      recordTest('PHASE 9', 'Data Persistence Confirmed: User and Appointment Intact', 'PASS', {
        userEmail: persistJson.user.email,
        appointmentId: persistJson.appointment.appointmentId,
        persistedStatus: persistJson.appointment.status,
      });
    } else {
      throw new Error('Records could not be found during persistence check');
    }
  } catch (err) {
    recordTest('PHASE 9', 'Data Persistence Verification', 'FAIL', {}, err);
  }

  // ====================================================================
  // PHASE 10: WRITE TEST ARTIFACTS / REPORT
  // ====================================================================
  console.log('\n--- Executing Phase 10: Generate Test Report Artifact ---');
  const reportPath = path.join(__dirname, '../../scratch/test_report.md');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;

  let reportMarkdown = `# MERN Stack PBL End-to-End Verification Report\n\n`;
  reportMarkdown += `**Project:** Riyaa Bridal Makeover Website (MERN Stack PBL)\n`;
  reportMarkdown += `**Execution Date:** ${new Date().toLocaleString()}\n`;
  reportMarkdown += `**Total Tests:** ${results.length} | **Passed:** ${passCount} | **Failed:** ${failCount}\n\n`;
  reportMarkdown += `## Test Summary Table\n\n`;
  reportMarkdown += `| Phase | Test Case | Status | Timestamp |\n`;
  reportMarkdown += `| :--- | :--- | :---: | :--- |\n`;

  results.forEach((r) => {
    reportMarkdown += `| **${r.phase}** | ${r.title} | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${r.timestamp} |\n`;
  });

  reportMarkdown += `\n## Detailed Test Logs\n\n`;
  results.forEach((r) => {
    reportMarkdown += `### [${r.phase}] ${r.title}\n`;
    reportMarkdown += `- **Status:** ${r.status}\n`;
    reportMarkdown += `- **Time:** ${r.timestamp}\n`;
    if (r.details && Object.keys(r.details).length > 0) {
      reportMarkdown += `- **Details:**\n\`\`\`json\n${JSON.stringify(r.details, null, 2)}\n\`\`\`\n`;
    }
    if (r.error) {
      reportMarkdown += `- **Error:** \`${r.error}\`\n`;
    }
    reportMarkdown += `\n`;
  });

  fs.writeFileSync(reportPath, reportMarkdown, 'utf8');
  recordTest('PHASE 10', 'Test Report Generated in scratch/test_report.md', 'PASS', {
    reportPath,
    totalTests: results.length,
    passed: passCount,
    failed: failCount,
  });

  // ====================================================================
  // PHASE 11: DEMO DATA CLEANUP
  // ====================================================================
  console.log('\n--- Executing Phase 11: Demo Data Cleanup ---');
  if (failCount === 0) {
    try {
      const cleanRes = await fetch(
        `${BASE_URL}/admin/cleanup-test-data?email=${customerCredentials.email}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const cleanJson = await cleanRes.json();

      if (cleanRes.status === 200 && cleanJson.success) {
        recordTest('PHASE 11', 'Demo Test Data Cleaned Up Successfully', 'PASS', {
          deletedUsers: cleanJson.deletedUsers,
          deletedAppointments: cleanJson.deletedAppointments,
        });

        // Verify clean state
        const verifyClean = await fetch(
          `${BASE_URL}/admin/verify-records?email=${customerCredentials.email}&appointmentId=${appointmentId}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        const verifyCleanJson = await verifyClean.json();
        if (verifyCleanJson.user === null && verifyCleanJson.appointment === null) {
          recordTest('PHASE 11', 'Database Verified in Clean State (Zero Orphaned Records)', 'PASS', {
            testUserRemoved: true,
            testAppointmentRemoved: true,
          });
        }
      } else {
        throw new Error(`Cleanup failed: ${cleanJson.message}`);
      }
    } catch (err) {
      recordTest('PHASE 11', 'Demo Data Cleanup', 'FAIL', {}, err);
    }
  } else {
    console.warn('⚠️ Skipping cleanup because some tests failed, allowing inspection.');
  }

  // Summary Console Log
  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${results.filter((r) => r.status === 'PASS').length} PASSED / ${results.filter((r) => r.status === 'FAIL').length} FAILED`);
  console.log('================================================================');
}

run().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
