import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import { Calendar, Clock, User, Sparkles, XCircle } from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setCancellingId(id);
      const res = await appointmentService.cancelAppointment(id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Appointment has been cancelled.' });
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel appointment.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="section page-top-space">
      <div className="container">
        <div className="section-title">
          <p className="eyebrow">Customer Portal</p>
          <h1>My Appointments</h1>
          <p className="subtitle">
            View your upcoming makeover sessions and track service statuses.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state card" style={{ padding: '3.5rem 1.5rem' }}>
            <Sparkles size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h2>No Appointments Found</h2>
            <p style={{ marginTop: '0.4rem', color: 'var(--muted)' }}>
              You have not booked any beauty or bridal sessions yet.
            </p>
            <Link to="/book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--muted)', fontWeight: 500 }}>
                Total Bookings: {appointments.length}
              </p>
              <Link to="/book" className="btn btn-primary btn-sm">
                + Book New Appointment
              </Link>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>
                        <strong>{apt.appointmentId}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                          {apt.serviceName}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="var(--muted)" />
                          {apt.appointmentDate}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: 'var(--muted)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <Clock size={13} />
                          {apt.appointmentTime}
                        </div>
                      </td>
                      <td>{apt.numberOfPeople} person(s)</td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {apt.notes || '—'}
                      </td>
                      <td>
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' ? (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={cancellingId === apt._id}
                            onClick={() => handleCancel(apt.appointmentId || apt._id)}
                          >
                            {cancellingId === apt._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
