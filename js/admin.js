document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.port === '5000' || window.location.port === '5173'
    ? '/api'
    : 'http://localhost:5000/api';

  let token = localStorage.getItem('riyaa_admin_token') || null;
  let currentTab = 'all';
  let activeAppointments = [];
  let selectedApt = null;

  // DOM Elements
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginAlert = document.getElementById('login-alert');
  const dashAlert = document.getElementById('dash-alert');
  const logoutBtn = document.getElementById('logout-btn');

  // Stats
  const statToday = document.getElementById('stat-today');
  const statUpcoming = document.getElementById('stat-upcoming');
  const statPending = document.getElementById('stat-pending');
  const statCompleted = document.getElementById('stat-completed');
  const statCancelled = document.getElementById('stat-cancelled');
  const statTotal = document.getElementById('stat-total');
  const statCards = document.querySelectorAll('.stat-card');

  // Filters
  const searchInput = document.getElementById('dash-search');
  const statusSelect = document.getElementById('dash-status');
  const dateInput = document.getElementById('dash-date');
  const resetBtn = document.getElementById('dash-reset');
  const tbody = document.getElementById('appointments-tbody');

  // Details Modal
  const detailsModal = document.getElementById('details-modal');
  const closeDetailsBtn = document.getElementById('close-details-btn');
  const modalAptContent = document.getElementById('modal-apt-content');
  const modalStatusSelect = document.getElementById('modal-status-select');
  const modalNotes = document.getElementById('modal-notes');
  const saveStatusBtn = document.getElementById('save-status-btn');

  // History Modal
  const historyModal = document.getElementById('history-modal');
  const openHistoryBtn = document.getElementById('open-history-btn');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const historyQueryInput = document.getElementById('history-query-input');
  const searchHistoryBtn = document.getElementById('search-history-btn');
  const historyResults = document.getElementById('history-results');

  // Initialize
  checkAuth();

  // Login event
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(loginAlert);

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed.');
      }

      if (data.user.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator role required.');
      }

      token = data.token;
      localStorage.setItem('riyaa_admin_token', token);
      showDashboard();
    } catch (err) {
      showAlert(loginAlert, err.message, 'error');
    }
  });

  // Logout event
  logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('riyaa_admin_token');
    showLogin();
  });

  function checkAuth() {
    if (token) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    loadStats();
    loadAppointments();
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logoutBtn.click();
        return;
      }
      const data = await res.json();
      if (data.success) {
        statToday.textContent = data.stats.today;
        statUpcoming.textContent = data.stats.upcoming;
        statPending.textContent = data.stats.pending;
        statCompleted.textContent = data.stats.completed;
        statCancelled.textContent = data.stats.cancelled;
        statTotal.textContent = data.stats.total;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAppointments() {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">Loading records from MongoDB...</td></tr>`;

    try {
      const params = new URLSearchParams();
      if (currentTab !== 'all') params.append('tab', currentTab);
      if (statusSelect.value !== 'All') params.append('status', statusSelect.value);
      if (dateInput.value) params.append('date', dateInput.value);
      if (searchInput.value.trim()) params.append('search', searchInput.value.trim());

      const res = await fetch(`${API_BASE}/admin/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load appointments.');
      }

      activeAppointments = data.appointments;
      renderAppointments(activeAppointments);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #dc2626;">Error: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function renderAppointments(list) {
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">No appointments found for this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((apt) => `
        <tr>
          <td><strong>${escapeHtml(apt.appointmentId)}</strong></td>
          <td>
            <div style="font-weight: 600; color: var(--primary-dark);">${escapeHtml(apt.customerName)}</div>
            <div style="font-size: 0.82rem; color: var(--muted);">${escapeHtml(apt.customerEmail)}</div>
          </td>
          <td><strong>${escapeHtml(apt.serviceName)}</strong></td>
          <td>${escapeHtml(apt.appointmentDate)}<br><small style="color: var(--muted);">${escapeHtml(apt.appointmentTime)}</small></td>
          <td>${escapeHtml(apt.customerPhone)}</td>
          <td><span class="status-badge ${escapeHtml(apt.status)}">${escapeHtml(apt.status)}</span></td>
          <td>
            <button class="btn btn-secondary view-btn" data-id="${apt.appointmentId || apt._id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">View</button>
          </td>
        </tr>
      `)
      .join('');

    tbody.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        selectedApt = activeAppointments.find((a) => (a.appointmentId || a._id) === id);
        if (selectedApt) openDetails(selectedApt);
      });
    });
  }

  function openDetails(apt) {
    modalAptContent.innerHTML = `
      <div style="background: #fff; padding: 1rem; border-radius: 0.8rem; border: 1px solid var(--line); margin-bottom: 1rem;">
        <p><strong>Appointment ID:</strong> ${escapeHtml(apt.appointmentId)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(apt.customerName)} (${escapeHtml(apt.customerPhone)})</p>
        <p><strong>Email:</strong> ${escapeHtml(apt.customerEmail)}</p>
        <p><strong>Service:</strong> ${escapeHtml(apt.serviceName)}</p>
        <p><strong>Date & Time:</strong> ${escapeHtml(apt.appointmentDate)} at ${escapeHtml(apt.appointmentTime)}</p>
        <p><strong>Guests:</strong> ${escapeHtml(apt.numberOfPeople)} person(s)</p>
        <p><strong>Current Status:</strong> <span class="status-badge ${escapeHtml(apt.status)}">${escapeHtml(apt.status)}</span></p>
      </div>
    `;
    modalStatusSelect.value = apt.status;
    modalNotes.value = apt.notes || '';
    detailsModal.classList.add('open');
  }

  saveStatusBtn.addEventListener('click', async () => {
    if (!selectedApt) return;
    const newStatus = modalStatusSelect.value;
    const newNotes = modalNotes.value.trim();

    try {
      const res = await fetch(`${API_BASE}/admin/appointments/${selectedApt.appointmentId || selectedApt._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes: newNotes }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');

      detailsModal.classList.remove('open');
      showAlert(dashAlert, `Status updated to ${newStatus} successfully.`, 'success');
      loadStats();
      loadAppointments();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  closeDetailsBtn.addEventListener('click', () => detailsModal.classList.remove('open'));

  // Stat Card Filtering
  statCards.forEach((card) => {
    card.addEventListener('click', () => {
      statCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      currentTab = card.dataset.tab;
      loadAppointments();
    });
  });

  // Filter Event Listeners
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadAppointments, 300);
  });
  statusSelect.addEventListener('change', loadAppointments);
  dateInput.addEventListener('change', loadAppointments);

  resetBtn.addEventListener('click', () => {
    currentTab = 'all';
    statCards.forEach((c) => c.classList.remove('active'));
    document.querySelector('.stat-card[data-tab="all"]').classList.add('active');
    searchInput.value = '';
    statusSelect.value = 'All';
    dateInput.value = '';
    loadAppointments();
  });

  // Customer History Lookup
  openHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('open');
    historyQueryInput.value = '';
    historyResults.innerHTML = '';
  });
  closeHistoryBtn.addEventListener('click', () => historyModal.classList.remove('open'));

  searchHistoryBtn.addEventListener('click', async () => {
    const q = historyQueryInput.value.trim();
    if (!q) return;

    historyResults.innerHTML = '<p style="color: var(--muted); text-align: center;">Searching history in MongoDB...</p>';

    try {
      const res = await fetch(`${API_BASE}/admin/customers/history?query=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lookup failed.');

      if (!data.appointments.length) {
        historyResults.innerHTML = '<p style="color: var(--muted); text-align: center;">No history found for this query.</p>';
        return;
      }

      const cust = data.customer;
      historyResults.innerHTML = `
        <div style="background: var(--surface-soft); padding: 1rem; border-radius: 0.8rem; border: 1px solid var(--line); margin-bottom: 1rem;">
          <h3 style="margin: 0;">${escapeHtml(cust.name)}</h3>
          <p style="color: var(--muted); font-size: 0.85rem; margin-top: 0.2rem;">Phone: ${escapeHtml(cust.phone)} | Email: ${escapeHtml(cust.email)}</p>
          <p style="margin-top: 0.5rem; font-weight: 600;">Total Lifetime Visits: ${data.totalVisits} (${data.completedVisits} completed)</p>
        </div>
        <div class="timeline">
          ${data.appointments.map(a => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${escapeHtml(a.serviceName)}</strong> — <span class="status-badge ${escapeHtml(a.status)}">${escapeHtml(a.status)}</span>
                <p style="font-size: 0.85rem; color: var(--muted); margin-top: 0.2rem;">📅 ${escapeHtml(a.appointmentDate)} at ${escapeHtml(a.appointmentTime)}</p>
                ${a.notes ? `<p style="font-size: 0.85rem; margin-top: 0.4rem; background: #fff9f6; padding: 0.4rem; border-radius: 0.4rem;">Notes: ${escapeHtml(a.notes)}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      historyResults.innerHTML = `<p style="color: #dc2626; text-align: center;">${escapeHtml(err.message)}</p>`;
    }
  });

  function showAlert(el, msg, type = 'error') {
    el.textContent = msg;
    el.style.display = 'block';
    if (type === 'error') {
      el.style.background = '#fee2e2';
      el.style.color = '#991b1b';
      el.style.border = '1px solid #fecaca';
    } else {
      el.style.background = '#d1fae5';
      el.style.color = '#065f46';
      el.style.border = '1px solid #a7f3d0';
    }
  }

  function hideAlert(el) {
    el.style.display = 'none';
  }

  function escapeHtml(str) {
    return String(str || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
});
