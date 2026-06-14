import React from 'react';

export default function CtaBanner() {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="cta-banner" className="cta-section" aria-labelledby="cta-heading">
      {/* Background decorations */}
      <div className="cta-bg-blob cta-bg-blob--1" aria-hidden="true" />
      <div className="cta-bg-blob cta-bg-blob--2" aria-hidden="true" />
      <div className="cta-particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`cta-particle cta-particle--${i + 1}`} />
        ))}
      </div>

      <div className="guest-container cta-inner scroll-animate">
        {/* Paw prints decoration */}
        <div className="cta-paw-row" aria-hidden="true">
          {'🐾'.repeat(5)}
        </div>

        <div className="cta-content">
          <h2 id="cta-heading" className="cta-title">
            Siap Memberikan yang Terbaik
            <br />
            untuk Hewan Peliharaanmu?
          </h2>
          <p className="cta-subtitle">
            Hubungi kami sekarang atau buat janji dengan dokter hewan kami.
            Tim kami siap membantu kapan saja.
          </p>

          <div className="cta-actions">
            <button
              id="cta-appointment-btn"
              className="guest-btn guest-btn--white guest-btn--lg"
              onClick={() => handleScrollTo('kontak')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Buat Janji Sekarang
            </button>
            <a
              id="cta-contact-btn"
              href="tel:+62812345678"
              className="guest-btn guest-btn--outline-white guest-btn--lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.54 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.07 6.07l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Hubungi Kami
            </a>
          </div>

          {/* Quick info chips */}
          <div className="cta-chips">
            {[
              '✅ Gratis Konsultasi Pertama',
              '📍 Mudah Dijangkau',
              '🚑 Layanan Darurat Tersedia',
            ].map((chip) => (
              <div key={chip} className="cta-chip">{chip}</div>
            ))}
          </div>
        </div>

        {/* Decorative pet icons */}
        <div className="cta-pet-icons" aria-hidden="true">
          <span className="cta-pet-icon cta-pet-icon--1">🐕</span>
          <span className="cta-pet-icon cta-pet-icon--2">🐈</span>
          <span className="cta-pet-icon cta-pet-icon--3">🐇</span>
          <span className="cta-pet-icon cta-pet-icon--4">🐹</span>
        </div>
      </div>
    </section>
  );
}
