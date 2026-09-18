const BASE_URL = 'http://localhost:5000/api';

async function verifyPersistencePreRestart() {
  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@riyaa.com', password: 'admin123' }),
  });
  const adminJson = await adminRes.json();
  const token = adminJson.token;

  // 2. Create customer and appointment for restart verification
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Restart Persistence Customer',
      email: 'restart.customer@example.com',
      phone: '9888888888',
      password: 'RestartTest@2026',
    }),
  });
  const regJson = await regRes.json();

  const apptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regJson.token}`,
    },
    body: JSON.stringify({
      name: 'Restart Persistence Customer',
      email: 'restart.customer@example.com',
      phone: '9888888888',
      serviceId: 'bridal_makeup',
      appointmentDate: '2026-10-15',
      appointmentTime: '02:00 PM',
      numberOfPeople: 1,
      notes: 'Server reboot persistence validation',
    }),
  });
  const apptJson = await apptRes.json();
  console.log('PRE_RESTART_APPT_CREATED:', apptJson.appointment.appointmentId);
}

async function verifyPersistencePostRestart() {
  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@riyaa.com', password: 'admin123' }),
  });
  const adminJson = await adminRes.json();
  const token = adminJson.token;

  // 2. Search appointment
  const searchRes = await fetch(`${BASE_URL}/admin/appointments?search=Restart%20Persistence%20Customer`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchJson = await searchRes.json();
  const appt = searchJson.appointments[0];

  if (appt && appt.customerEmail === 'restart.customer@example.com') {
    console.log('POST_RESTART_VERIFIED_SUCCESS:', appt.appointmentId, appt.customerName, appt.status);
    // Cleanup this verification record
    await fetch(`${BASE_URL}/admin/cleanup-test-data?email=restart.customer@example.com`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('POST_RESTART_CLEANUP_SUCCESS');
  } else {
    console.error('POST_RESTART_VERIFICATION_FAILED: record not found after restart');
    process.exit(1);
  }
}

const mode = process.argv[2];
if (mode === 'pre') {
  verifyPersistencePreRestart().catch(console.error);
} else if (mode === 'post') {
  verifyPersistencePostRestart().catch(console.error);
}
