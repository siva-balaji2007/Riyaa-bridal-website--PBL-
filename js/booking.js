document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('appointment-form');
  const alertBox = document.getElementById('booking-alert');
  const successBox = document.getElementById('booking-success');
  const successId = document.getElementById('success-apt-id');
  const successDetails = document.getElementById('success-details');
  const bookAnotherBtn = document.getElementById('book-another-btn');
  const submitBtn = document.getElementById('submit-btn');
  const dateInput = document.getElementById('appointmentDate');
  const serviceSelect = document.getElementById('serviceId');

  if (!form) return;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = today;
  }

  // Pre-select service if passed in query string
  const urlParams = new URLSearchParams(window.location.search);
  const requestedService = urlParams.get('service');
  if (requestedService && serviceSelect) {
    serviceSelect.value = requestedService;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const formData = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      serviceId: form.serviceId.value,
      appointmentDate: form.appointmentDate.value,
      appointmentTime: form.appointmentTime.value,
      numberOfPeople: Number(form.numberOfPeople.value) || 1,
      notes: form.notes.value.trim(),
    };

    // Client validation
    if (!formData.name || !formData.phone || !formData.email || !formData.appointmentDate) {
      showAlert('Please fill in all required fields.', 'error');
      return;
    }

    if (formData.appointmentDate < today) {
      showAlert('Appointment date cannot be in the past.', 'error');
      return;
    }

    // Prevent duplicate clicks & show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Appointment to Database...';

    // Target API endpoint (supports both direct static file open and hosted server)
    const apiEndpoint = window.location.port === '5000' || window.location.port === '5173'
      ? '/api/appointments'
      : 'http://localhost:5000/api/appointments';

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to book appointment.');
      }

      // Success
      const apt = data.appointment;
      form.style.display = 'none';
      successBox.style.display = 'block';
      successId.textContent = `ID: ${apt.appointmentId}`;
      successDetails.innerHTML = `
        <p><strong>Customer:</strong> ${escapeHtml(apt.customerName)}</p>
        <p><strong>Service:</strong> ${escapeHtml(apt.serviceName)}</p>
        <p><strong>Date & Time:</strong> ${escapeHtml(apt.appointmentDate)} at ${escapeHtml(apt.appointmentTime)}</p>
        <p><strong>Contact Phone:</strong> ${escapeHtml(apt.customerPhone)}</p>
        <p><strong>Status:</strong> <span style="color: #b45309; font-weight: 600;">${escapeHtml(apt.status)}</span></p>
        <p style="margin-top: 0.5rem; color: #7a6870; font-size: 0.85rem;">Your booking is permanently stored in MongoDB. The beautician can now access and confirm this record.</p>
      `;
    } catch (err) {
      showAlert(err.message || 'Unable to connect to server. Please ensure the backend is running.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Book Appointment';
    }
  });

  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'flex';
      successBox.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Book Appointment';
      hideAlert();
    });
  }

  function showAlert(msg, type = 'error') {
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
    if (type === 'error') {
      alertBox.style.background = '#fee2e2';
      alertBox.style.color = '#991b1b';
      alertBox.style.border = '1px solid #fecaca';
    } else {
      alertBox.style.background = '#d1fae5';
      alertBox.style.color = '#065f46';
      alertBox.style.border = '1px solid #a7f3d0';
    }
  }

  function hideAlert() {
    alertBox.style.display = 'none';
  }

  function escapeHtml(str) {
    return String(str || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
});
