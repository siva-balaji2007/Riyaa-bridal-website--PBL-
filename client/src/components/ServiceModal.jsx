import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ServiceModal({ service, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <h2>{service.name}</h2>
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <p>
            <strong>Category:</strong> {service.category}
          </p>
          <p>
            <strong>Price:</strong> {service.priceRange}
          </p>
          <p>
            <strong>Duration:</strong> {service.duration}
          </p>
        </div>
        <p style={{ marginTop: '0.8rem', color: 'var(--muted)' }}>{service.description}</p>

        {service.benefits && service.benefits.length > 0 && (
          <div style={{ marginTop: '1.2rem' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>Benefits</h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', listStyle: 'disc' }}>
              {service.benefits.map((benefit, idx) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {service.process && service.process.length > 0 && (
          <div style={{ marginTop: '1.2rem' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>Treatment Process</h4>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--muted)', listStyle: 'decimal' }}>
              {service.process.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div style={{ marginTop: '1.8rem', display: 'flex', gap: '1rem' }}>
          <Link
            to={`/book?service=${service.serviceId}`}
            className="btn btn-primary"
            onClick={onClose}
          >
            Book This Service Now
          </Link>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
