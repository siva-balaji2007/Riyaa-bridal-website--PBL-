import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Heart, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero section">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="eyebrow">Welcome To Riyaa Bridal Makeover</p>
            <h1>Enhancing Your Natural Beauty</h1>
            <p>
              Step into a calm, elegant space where expert care meets modern beauty rituals.
              From radiant skin to glamorous bridal looks, we craft confidence for every occasion.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Link className="btn btn-primary" to="/book">
                <Calendar size={18} />
                Book Now
              </Link>
              <Link className="btn btn-secondary" to="/services">
                Explore Services
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="glow-effect"></div>
            <div className="hero-image">
              <img src="/images/beauty-hero.png" alt="Beauty Service Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="container">
          <div className="section-title">
            <p className="eyebrow">Featured Services</p>
            <h2>Popular Treatments</h2>
            <p className="subtitle">Hand-crafted makeover packages tailored for your special moments.</p>
          </div>
          <div className="card-grid">
            <article className="card">
              <div className="card-image">Facial Glow</div>
              <div className="card-body">
                <h3>Luxury Facial</h3>
                <p>Deep cleansing, exfoliation, and hydration to restore radiance and softness.</p>
                <span className="price">Rs. 1,200 - Rs. 2,500</span>
              </div>
            </article>

            <article className="card">
              <div className="card-image">Hair Care</div>
              <div className="card-body">
                <h3>Hair Spa Therapy</h3>
                <p>Nourishing treatment for dry, damaged hair with scalp relaxation massage.</p>
                <span className="price">Rs. 1,000 - Rs. 2,200</span>
              </div>
            </article>

            <article className="card">
              <div className="card-image">Bridal Look</div>
              <div className="card-body">
                <h3>Bridal Makeup</h3>
                <p>Long-lasting HD makeup designed to elevate your wedding day glow.</p>
                <span className="price">Rs. 8,000 - Rs. 20,000</span>
              </div>
            </article>

            <article className="card">
              <div className="card-image">Nail Art</div>
              <div className="card-body">
                <h3>Manicure & Polish</h3>
                <p>Classic manicure with shaping, cuticle care, and your choice of finish.</p>
                <span className="price">Rs. 500 - Rs. 1,500</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container cta-box">
          <h2>Ready For Your Glow-Up?</h2>
          <p>Reserve your appointment today and let our certified stylists create a look you will adore.</p>
          <Link className="btn btn-secondary" to="/book" style={{ marginTop: '0.8rem' }}>
            Book Your Session
          </Link>
        </div>
      </section>
    </div>
  );
}
