import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../../lib/supabaseService';

function AnimatedCounter({ target, suffix = '', duration = 1500, isFloat = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) {
      setCount(target);
      return;
    }
    if (end === 0) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);
      
      const current = isFloat 
        ? parseFloat((rate * end).toFixed(1)) 
        : Math.floor(rate * end);

      setCount(current);

      if (rate < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isFloat]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

export default function HeroSection() {
  const [stats, setStats] = useState({
    patients: 5000,
    members: 500
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats({
          patients: 5000 + (data.totalPasien || 0),
          members: 500 + (data.totalMembers || 0)
        });
      } catch (e) {
        console.error("Failed to load hero stats:", e);
      }
    };
    loadStats();
  }, []);

  const navigate = useNavigate();

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="beranda" className="hero-section" aria-label="Hero">
      {/* Background decorations */}
      <div className="hero-bg-blob hero-bg-blob--1" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob--2" aria-hidden="true" />
      <div className="hero-bg-blob hero-bg-blob--3" aria-hidden="true" />

      <div className="guest-container hero-inner">
        {/* Left Content */}
        <div className="hero-content scroll-animate">
          <div className="hero-badge">
            <span className="hero-badge__dot" aria-hidden="true" />
            🏆 Klinik Hewan Terpercaya #1
          </div>

          <h1 className="hero-headline">
            Kesehatan Hewan{' '}
            <span className="hero-headline--gradient">Peliharaanmu</span>,{' '}
            <br className="hero-headline__break" />
            Prioritas Kami
          </h1>

          <p className="hero-subheadline">
            Klinik hewan terpercaya dengan dokter berpengalaman dan layanan
            lengkap untuk sahabat berbulu kesayanganmu. Kami hadir dengan
            penuh kasih dan profesionalisme.
          </p>

          <div className="hero-actions">
            <button
              id="hero-cta-register"
              className="guest-btn guest-btn--primary guest-btn--lg"
              onClick={() => navigate('/register')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Daftar Gratis Sekarang
            </button>
            <button
              id="hero-cta-services"
              className="guest-btn guest-btn--outline guest-btn--lg"
              onClick={() => handleScrollTo('layanan')}
            >
              Lihat Layanan Kami
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { id: 'pasien', target: stats.patients, suffix: '+', label: 'Pasien Dilayani', duration: 2000 },
              { id: 'dokter', target: 8, suffix: '+', label: 'Dokter Spesialis', duration: 1500 },
              { id: 'hari', target: 7, suffix: '', label: 'Hari / Minggu', duration: 1000 },
              { id: 'kepuasan', target: 99, suffix: '%', label: 'Kepuasan Klien', duration: 2000 },
              { id: 'rating', target: 4.8, suffix: '★', label: 'Rating', duration: 1000, isFloat: true },
              { id: 'member', target: stats.members, suffix: '+', label: 'Member Aktif', duration: 2000 }
            ].map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span className="hero-stat__value">
                  <AnimatedCounter 
                    target={stat.target} 
                    suffix={stat.suffix} 
                    duration={stat.duration} 
                    isFloat={stat.isFloat} 
                  />
                </span>
                <span className="hero-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hero-illustration scroll-animate" style={{ animationDelay: '0.2s' }} aria-hidden="true">
          <div className="hero-illustration__card hero-illustration__card--main">
            <div className="hero-illustration__pet-scene">
              {/* Animated pet SVG illustration */}
              <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-pet-svg">
                {/* Background circle */}
                <circle cx="160" cy="160" r="140" fill="url(#heroGrad1)" opacity="0.12" />
                <circle cx="160" cy="160" r="110" fill="url(#heroGrad1)" opacity="0.08" />

                {/* Dog body */}
                <ellipse cx="160" cy="190" rx="65" ry="50" fill="#f5e6d3" />
                {/* Dog head */}
                <circle cx="160" cy="125" r="52" fill="#f5e6d3" />
                {/* Dog ears */}
                <ellipse cx="120" cy="100" rx="22" ry="30" fill="#d4a373" transform="rotate(-15 120 100)" />
                <ellipse cx="200" cy="100" rx="22" ry="30" fill="#d4a373" transform="rotate(15 200 100)" />
                {/* Dog face */}
                <ellipse cx="150" cy="137" rx="8" ry="9" fill="#2d1b0e" /> {/* left eye */}
                <ellipse cx="170" cy="137" rx="8" ry="9" fill="#2d1b0e" /> {/* right eye */}
                <circle cx="152" cy="135" r="2.5" fill="white" /> {/* eye shine left */}
                <circle cx="172" cy="135" r="2.5" fill="white" /> {/* eye shine right */}
                {/* Nose */}
                <ellipse cx="160" cy="148" rx="9" ry="6" fill="#2d1b0e" />
                <ellipse cx="158" cy="146" rx="2" ry="1.5" fill="white" opacity="0.6" />
                {/* Smile */}
                <path d="M148 155 Q160 165 172 155" stroke="#2d1b0e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Cheeks */}
                <circle cx="136" cy="150" r="10" fill="#f4a261" opacity="0.4" />
                <circle cx="184" cy="150" r="10" fill="#f4a261" opacity="0.4" />
                {/* Paws */}
                <ellipse cx="115" cy="225" rx="22" ry="16" fill="#f5e6d3" />
                <ellipse cx="205" cy="225" rx="22" ry="16" fill="#f5e6d3" />
                {/* Paw details left */}
                <circle cx="108" cy="228" r="5" fill="#d4a373" />
                <circle cx="118" cy="232" r="5" fill="#d4a373" />
                <circle cx="128" cy="228" r="5" fill="#d4a373" />
                {/* Paw details right */}
                <circle cx="198" cy="228" r="5" fill="#d4a373" />
                <circle cx="208" cy="232" r="5" fill="#d4a373" />
                <circle cx="218" cy="228" r="5" fill="#d4a373" />
                {/* Tail wagging */}
                <path d="M220 195 Q250 160 240 130 Q255 115 265 140" stroke="#d4a373" strokeWidth="14" strokeLinecap="round" fill="none" className="hero-tail" />

                {/* Stethoscope */}
                <circle cx="160" cy="170" r="8" fill="#16a34a" opacity="0.8" />
                <path d="M155 170 Q150 190 145 195 Q138 202 138 210 Q138 216 144 216 Q150 216 150 210" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="150" cy="215" r="6" fill="none" stroke="#16a34a" strokeWidth="3" />
                <path d="M165 170 Q170 190 175 195 Q182 202 182 210 Q182 216 176 216 Q170 216 170 210" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="170" cy="215" r="6" fill="none" stroke="#16a34a" strokeWidth="3" />

                <defs>
                  <linearGradient id="heroGrad1" x1="0" y1="0" x2="320" y2="320">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating elements */}
              <div className="hero-float hero-float--paw hero-float--1">🐾</div>
              <div className="hero-float hero-float--paw hero-float--2">❤️</div>
              <div className="hero-float hero-float--paw hero-float--3">⭐</div>
            </div>
          </div>

          {/* Floating info cards */}
          <div className="hero-info-card hero-info-card--top">
            <div className="hero-info-card__icon">✅</div>
            <div>
              <div className="hero-info-card__title">Dokter Bersertifikat</div>
              <div className="hero-info-card__sub">Profesional & Terpercaya</div>
            </div>
          </div>

          <div className="hero-info-card hero-info-card--bottom">
            <div className="hero-info-card__icon">🕐</div>
            <div>
              <div className="hero-info-card__title">Buka Setiap Hari</div>
              <div className="hero-info-card__sub">08:00 – 21:00 WIB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        className="hero-scroll-indicator"
        onClick={() => handleScrollTo('layanan')}
        aria-label="Scroll ke layanan"
      >
        <span className="hero-scroll-indicator__text">Scroll</span>
        <div className="hero-scroll-indicator__mouse">
          <div className="hero-scroll-indicator__dot" />
        </div>
      </button>
    </section>
  );
}
