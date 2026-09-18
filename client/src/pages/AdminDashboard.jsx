import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { serviceService } from '../services/serviceService';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // all, today, upcoming, pending, completed, cancelled
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals state
  const [detailsModalApt, setDetailsModalApt] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Customer History Lookup State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyResult, setHistoryResult] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, selectedStatus, selectedService, selectedDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceService.getAllServices();
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        tab: activeTab !== 'all' ? activeTab : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        service: selectedService !== 'All' ? selectedService : undefined,
        date: selectedDate || undefined,
        search: search.trim() || undefined,
      };

      const res = await adminService.getAllAppointments(params);
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await adminService.updateAppointmentStatus(id, { status: newStatus });
      if (res.success) {
        setMessage({ type: 'success', text: `Appointment status updated to ${newStatus}` });
        fetchAppointments();
        fetchStats();
        if (detailsModalApt && (detailsModalApt._id === id || detailsModalApt.appointmentId === id)) {
          setDetailsModalApt(res.appointment);
        }
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveDetails = async () => {
    if (!detailsModalApt) return;
    try {
      setUpdatingId(detailsModalApt._id);
      const res = await adminService.updateAppointmentStatus(
        detailsModalApt.appointmentId || detailsModalApt._id,
        {
          status: editStatus,
          notes: editNotes,
        }
      );
      if (res.success) {
        setMessage({ type: 'success', text: 'Appointment details updated successfully.' });
        setDetailsModalApt(null);
        fetchAppointments();
        fetchStats();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update appointment.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailsModal = (apt) => {
    setDetailsModalApt(apt);
    setEditNotes(apt.notes || '');
    setEditStatus(apt.status);
  };

  const handleSearchCustomerHistory = async (e) => {
    if (e) e.preventDefault();
    if (!historyQuery.trim()) return;

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const res = await adminService.getCustomerHistory({ query: historyQuery.trim() });
      if (res.success) {
        setHistoryResult(res);
      }
    } catch (err) {
      setHistoryResult(null);
      setHistoryError(err.response?.data?.message || 'Customer history lookup failed.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const resetFilters = () => {
    setActiveTab('all');
    setSearch('');
    setSelectedStatus('All');
    setSelectedService('All');
    setSelectedDate('');
  };

  return (
    <main className="section page-top-space">
      <div className="container">
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p className="eyebrow">Salon Administration</p>
            <h1>Beautician Dashboard</h1>
            <p className="subtitle">
              Manage live bookings, update makeover statuses, and inspect client history.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setHistoryOpen(true);
              setHistoryQuery('');
              setHistoryResult(null);
            }}
          >
            <History size={16} />
            Search Customer History
          </button>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
            <span>{message.text}</span>
            <button
              style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', fontWeight: 700 }}
              onClick={() => setMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Metric KPI Cards */}
        <div className="admin-stats-grid">
          <div
            className={`stat-card ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'today' ? 'all' : 'today')}
          >
            <div className="stat-title">Today</div>
            <div className="stat-number">{stats.today}</div>
          </div>

          <div
            className={`stat-card ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'upcoming' ? 'all' : 'upcoming')}
          >
            <div className="stat-title">Upcoming</div>
            <div className="stat-number">{stats.upcoming}</div>
          </div>

          <div
            className={`stat-card ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'pending' ? 'all' : 'pending')}
          >
            <div className="stat-title" style={{ color: '#b45309' }}>Pending</div>
            <div className="stat-number" style={{ color: '#b45309' }}>{stats.pending}</div>
          </div>

          <div
            className={`stat-card ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'completed' ? 'all' : 'completed')}
          >
            <div className="stat-title" style={{ color: '#059669' }}>Completed</div>
            <div className="stat-number" style={{ color: '#059669' }}>{stats.completed}</div>
          </div>

          <div
            className={`stat-card ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'cancelled' ? 'all' : 'cancelled')}
          >
            <div className="stat-title" style={{ color: '#dc2626' }}>Cancelled</div>
            <div className="stat-number" style={{ color: '#dc2626' }}>{stats.cancelled}</div>
          </div>

          <div
            className={`stat-card ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <div className="stat-title">Total Lifetime</div>
            <div className="stat-number">{stats.total}</div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Reset */}
        <div className="admin-toolbar">
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by customer name, phone, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="filter-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              aria-label="Filter by Service"
            >
              <option value="All">All Services</option>
              {services.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="filter-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Filter by Date"
            />

            {(selectedStatus !== 'All' || selectedService !== 'All' || selectedDate || search || activeTab !== 'all') && (
              <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading appointments from MongoDB...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={42} style={{ margin: '0 auto 0.8rem', color: 'var(--primary)' }} />
              <h3>No Appointments Found</h3>
              <p style={{ marginTop: '0.3rem', color: 'var(--muted)' }}>
                Try adjusting your search query, status filters, or selected date.
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Details</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {apt.appointmentId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {apt.customerName}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={11} /> {apt.customerPhone}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Mail size={11} /> {apt.customerEmail}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{apt.serviceName}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="var(--muted)" />
                        {apt.appointmentDate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', color: 'var(--muted)' }}>
                        <Clock size={12} />
                        {apt.appointmentTime}
                      </div>
                    </td>
                    <td>{apt.numberOfPeople} person(s)</td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          title="View & Edit Details"
                          onClick={() => openDetailsModal(apt)}
                        >
                          <Eye size={13} />
                          Details
                        </button>

                        <select
                          className="filter-select"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          value={apt.status}
                          disabled={updatingId === apt._id}
                          onChange={(e) =>
                            handleStatusChange(apt.appointmentId || apt._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirm</option>
                          <option value="Completed">Complete</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Appointment Details & Edit Modal */}
      {detailsModalApt && (
        <div className="modal-overlay" onClick={() => setDetailsModalApt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setDetailsModalApt(null)}>
              &times;
            </button>

            <h2>Appointment Details</h2>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span className="booking-id-pill" style={{ margin: 0, fontSize: '0.9rem' }}>
                {detailsModalApt.appointmentId}
              </span>
              <StatusBadge status={detailsModalApt.status} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '1.5rem 0',
                padding: '1.2rem',
                background: '#fff',
                borderRadius: '0.9rem',
                border: '1px solid var(--line)',
              }}
            >
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Customer Name</p>
                <p style={{ fontWeight: 600 }}>{detailsModalApt.customerName}</p>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Phone</p>
                <p style={{ fontWeight: 600 }}>{detailsModalApt.customerPhone}</p>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Email</p>
                <p style={{ fontWeight: 600 }}>{detailsModalApt.customerEmail}</p>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Service</p>
                <p style={{ fontWeight: 600 }}>{detailsModalApt.serviceName}</p>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Date & Time</p>
                <p style={{ fontWeight: 600 }}>
                  {detailsModalApt.appointmentDate} at {detailsModalApt.appointmentTime}
                </p>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--muted)' }}>Guests</p>
                <p style={{ fontWeight: 600 }}>{detailsModalApt.numberOfPeople} person(s)</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Update Appointment Status</label>
              <select
                className="filter-select"
                style={{ width: '100%' }}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="Pending">Pending (Awaiting Confirmation)</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Client Notes / Special Requirements</label>
              <textarea
                rows="3"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add beautician notes or special client requests..."
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDetailsModalApt(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={updatingId === detailsModalApt._id}
                onClick={handleSaveDetails}
              >
                {updatingId === detailsModalApt._id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer History Lookup Modal / Drawer */}
      {historyOpen && (
        <div className="modal-overlay" onClick={() => setHistoryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <button className="close-btn" onClick={() => setHistoryOpen(false)}>
              &times;
            </button>

            <h2>Customer History Lookup</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Search any client by Name, Phone, or Email to view their complete service history.
            </p>

            <form onSubmit={handleSearchCustomerHistory} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="e.g. Priya or 9876500001 or priya@example.com"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.7rem',
                  border: '1px solid var(--line)',
                  font: 'inherit',
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={historyLoading}>
                {historyLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {historyError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{historyError}</span>
              </div>
            )}

            {historyResult && (
              <div>
                {/* Customer Profile Header */}
                <div
                  style={{
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--line)',
                    borderRadius: '1rem',
                    padding: '1.2rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>
                        {historyResult.customer?.name || 'Customer Profile'}
                      </h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                        Phone: <strong>{historyResult.customer?.phone}</strong> | Email: <strong>{historyResult.customer?.email}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Lifetime Bookings</p>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {historyResult.totalVisits}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline of Appointments */}
                <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Appointment History ({historyResult.appointments.length})
                </h4>

                {historyResult.appointments.length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>No appointment records found for this customer.</p>
                ) : (
                  <div className="timeline">
                    {historyResult.appointments.map((apt) => (
                      <div key={apt._id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--primary-dark)' }}>
                                {apt.serviceName}
                              </strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                                📅 {apt.appointmentDate} at {apt.appointmentTime} ({apt.numberOfPeople} person)
                              </p>
                            </div>
                            <StatusBadge status={apt.status} />
                          </div>
                          {apt.notes && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.5rem', background: '#fff9f6', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--line)' }}>
                              <strong>Notes:</strong> {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
