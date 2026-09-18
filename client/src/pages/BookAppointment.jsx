import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceService } from '../services/serviceService';
import { appointmentService } from '../services/appointmentService';
import { Calendar, Clock, User, Phone, Mail, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service') || '';
  const { user, isAuthenticated } = useAuth();

  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    serviceId: preSelectedService,
    appointmentDate: '',
    appointmentTime: '10:00 AM',
    numberOfPeople: 1,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (preSelectedService) {
      setFormData((prev) => ({ ...prev, serviceId: preSelectedService }));
    }
  }, [preSelectedService]);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      if (data.success) {
        setServices(data.services);
        if (!formData.serviceId && data.services.length > 0) {
          setFormData((prev) => ({ ...prev, serviceId: data.services[0].serviceId }));
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.appointmentDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.appointmentDate < todayString) {
      setError('Appointment date cannot be in the past. Please select today or a future date.');
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.createAppointment(formData);
      if (res.success) {
        setSuccessData(res.appointment);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to book appointment. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      serviceId: services[0]?.serviceId || '',
      appointmentDate: '',
      appointmentTime: '10:00 AM',
      numberOfPeople: 1,
      notes: '',
    });
  };

  return (
    <main className="section page-top-space">
      <div className="container">
        <div className="section-title">
          <p className="eyebrow">Get In Touch</p>
          <h1>Book An Appointment</h1>
          <p className="subtitle">
            Schedule your beauty session or bridal consultation with our certified artists.
          </p>
        </div>

        <section className="contact-layout">
          {/* Booking Form Wrap */}
          <div className="contact-form-wrap card">
            {successData ? (
              <div className="booking-success-card">
                <div className="success-icon">
                  <CheckCircle2 size={36} />
                </div>
                <h2>Appointment Confirmed!</h2>
                <p style={{ color: 'var(--muted)', marginTop: '0.4rem' }}>
                  Thank you, <strong>{successData.customerName}</strong>. Your makeover booking has been
                  saved permanently in our system.
                </p>

                <div>
                  <span className="booking-id-pill">ID: {successData.appointmentId}</span>
                </div>

                <div
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: '0.9rem',
                    padding: '1.2rem',
                    textAlign: 'left',
                    margin: '1.2rem 0',
                  }}
                >
                  <p>
                    <strong>Service:</strong> {successData.serviceName}
                  </p>
                  <p>
                    <strong>Date & Time:</strong> {successData.appointmentDate} at{' '}
                    {successData.appointmentTime}
                  </p>
                  <p>
                    <strong>Guests:</strong> {successData.numberOfPeople} Person(s)
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: '#b45309', fontWeight: 600 }}>{successData.status}</span>
                  </p>
                  <p style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Our salon team will contact you at <strong>{successData.customerPhone}</strong> for final ceremony coordination.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {isAuthenticated && (
                    <Link to="/my-appointments" className="btn btn-primary">
                      View My Bookings
                    </Link>
                  )}
                  <button className="btn btn-secondary" onClick={handleReset}>
                    Book Another Appointment
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2>Reserve Your Spot</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Fill in your details below to schedule your appointment.
                </p>

                {error && (
                  <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="serviceId">
                      Select Service *
                    </label>
                    <select
                      id="serviceId"
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleChange}
                      required
                    >
                      {services.map((s) => (
                        <option key={s.serviceId} value={s.serviceId}>
                          {s.name} ({s.category}) — {s.priceRange}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointmentDate">
                        Appointment Date *
                      </label>
                      <input
                        id="appointmentDate"
                        name="appointmentDate"
                        type="date"
                        min={todayString}
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="appointmentTime">
                        Preferred Time Slot *
                      </label>
                      <select
                        id="appointmentTime"
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleChange}
                        required
                      >
                        <option value="10:00 AM">10:00 AM - 11:30 AM</option>
                        <option value="11:30 AM">11:30 AM - 01:00 PM</option>
                        <option value="01:00 PM">01:00 PM - 02:30 PM</option>
                        <option value="02:30 PM">02:30 PM - 04:00 PM</option>
                        <option value="04:00 PM">04:00 PM - 05:30 PM</option>
                        <option value="05:30 PM">05:30 PM - 07:00 PM</option>
                        <option value="07:00 PM">07:00 PM - 08:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="numberOfPeople">
                      Number of People
                    </label>
                    <select
                      id="numberOfPeople"
                      name="numberOfPeople"
                      value={formData.numberOfPeople}
                      onChange={handleChange}
                    >
                      <option value="1">1 Person (Solo Makeover)</option>
                      <option value="2">2 Persons (Bride + 1)</option>
                      <option value="3">3 Persons (Bridal Party)</option>
                      <option value="4">4+ Persons (Group Package)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">
                      Special Requests / Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      placeholder="Skin allergies, preferred cosmetics brand, event time, or special requirements..."
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '0.8rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Confirming Appointment...' : 'Book Appointment Now'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Contact Details & Map */}
          <aside className="contact-info card">
            <h2>Contact Details</h2>
            <ul>
              <li>
                <strong>Phone:</strong> +91 98765 43210
              </li>
              <li>
                <strong>Address:</strong> Riyaa Bridal Makeover, canara bank, Aks complex, gobi main
                road, opp. Thingalur, perundurai, Tamil Nadu 638055
              </li>
              <li>
                <strong>Working Hours:</strong> Mon - Sun, 10:00 AM - 8:00 PM
              </li>
            </ul>

            <div className="map-wrap">
              <iframe
                title="Beauty parlor location map"
                src="https://www.google.com/maps?q=11.320850,77.487647&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>

            <a
              className="btn btn-secondary"
              href="https://www.google.com/maps?q=11.320850,77.487647"
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%' }}
            >
              Get Directions
            </a>
          </aside>
        </section>
      </div>
    </main>
  );
}
