import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import ServiceModal from '../components/ServiceModal';

export default function Services() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAllServices(filter);
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hair', label: 'Hair' },
    { id: 'skin', label: 'Skin' },
    { id: 'bridal', label: 'Bridal' },
    { id: 'nails', label: 'Nails' },
  ];

  return (
    <main className="section page-top-space">
      <div className="container">
        <div className="section-title">
          <p className="eyebrow">Our Catalog</p>
          <h1>Beauty & Bridal Services</h1>
          <p className="subtitle">
            Explore curated treatments crafted for every style, ceremony, and occasion.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" aria-label="Service categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading beauty services catalog...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>No services found in this category.</p>
          </div>
        ) : (
          <section className="card-grid services-grid">
            {services.map((service) => (
              <article
                key={service.serviceId}
                className="card service-card"
                onClick={() => setSelectedService(service)}
              >
                <div className="card-image">{service.category}</div>
                <div className="card-body">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <span className="price">{service.priceRange}</span>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </main>
  );
}
