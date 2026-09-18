import React from 'react';

export default function About() {
  return (
    <main className="section page-top-space">
      <div className="container">
        <section className="about-layout">
          <div className="about-copy">
            <p className="eyebrow">Who We Are</p>
            <h1>About Our Beauty Studio</h1>
            <p>
              Riyaa Bridal Makeover is a modern beauty studio dedicated to helping clients look and feel
              their absolute best. We blend personalized consultation, hygiene-first practices, and premium
              cosmetics to deliver safe, soothing, and transformative beauty experiences.
            </p>
            <p style={{ marginTop: '1rem' }}>
              From everyday skin and hair care to glamorous bridal transformations, our certified specialists
              focus on enhancing your natural features while honoring your personal style and comfort.
            </p>
          </div>
          <div className="about-mission card">
            <h2>Our Mission</h2>
            <p style={{ marginTop: '0.8rem', color: 'var(--muted)' }}>
              To create a welcoming, hygienic sanctuary where every bride and client receives attentive care,
              thoughtful artistry, and confidence-boosting results that celebrate authentic natural radiance.
            </p>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                <strong>Quality Assurance:</strong> 100% sterilized tools & genuine premium beauty products.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
