import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    id: 'feat-booking',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <rect x="6" y="10" width="36" height="32" rx="5" fill="url(#featGrad1)" opacity="0.15"/>
        <rect x="6" y="10" width="36" height="32" rx="5" stroke="url(#featGrad1)" strokeWidth="2.5"/>
        <line x1="16" y1="6" x2="16" y2="14" stroke="url(#featGrad1)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="32" y1="6" x2="32" y2="14" stroke="url(#featGrad1)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="6" y1="20" x2="42" y2="20" stroke="url(#featGrad1)" strokeWidth="2"/>
        <circle cx="16" cy="30" r="3" fill="url(#featGrad1)"/>
        <circle cx="24" cy="30" r="3" fill="url(#featGrad1)" opacity="0.5"/>
        <circle cx="32" cy="30" r="3" fill="url(#featGrad1)" opacity="0.3"/>
        <defs>
          <linearGradient id="featGrad1" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#16a34a"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    color: 'green',
    title: 'Booking Online',
    tagline: 'Pesan Jadwal di Mana Saja',
    desc: 'Tidak perlu telepon atau datang langsung. Pilih dokter, pilih waktu, konfirmasi — selesai dalam 60 detik dari HP Anda.',
    highlights: ['Pilih dokter & jam sesuka hati', 'Notifikasi reminder otomatis', 'Reschedule mudah kapan saja'],
  },
  {
    id: 'feat-rekam-medis',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <rect x="8" y="4" width="28" height="36" rx="4" fill="url(#featGrad2)" opacity="0.15"/>
        <rect x="8" y="4" width="28" height="36" rx="4" stroke="url(#featGrad2)" strokeWidth="2.5"/>
        <line x1="14" y1="14" x2="30" y2="14" stroke="url(#featGrad2)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="21" x2="30" y2="21" stroke="url(#featGrad2)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="28" x2="24" y2="28" stroke="url(#featGrad2)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="38" cy="38" r="8" fill="url(#featGrad2)"/>
        <polyline points="34,38 37,41 42,35" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="featGrad2" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    color: 'blue',
    title: 'Rekam Medis Digital',
    tagline: 'Histori Kesehatan Lengkap',
    desc: 'Semua catatan kunjungan, diagnosis, resep, dan vaksinasi tersimpan aman di satu tempat. Akses kapan saja, dari mana saja.',
    highlights: ['Riwayat vaksinasi lengkap', 'Catatan dokter & resep digital', 'Berbagi rekam medis ke dokter lain'],
  },
  {
    id: 'feat-membership',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <polygon points="24,4 29,18 44,18 32,28 37,42 24,33 11,42 16,28 4,18 19,18" fill="url(#featGrad3)" opacity="0.15"/>
        <polygon points="24,4 29,18 44,18 32,28 37,42 24,33 11,42 16,28 4,18 19,18" stroke="url(#featGrad3)" strokeWidth="2.5" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="featGrad3" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    color: 'orange',
    title: 'Program Membership & Poin',
    tagline: 'Setia = Dapat Reward',
    desc: 'Setiap kunjungan menghasilkan poin yang bisa ditukarkan dengan diskon, layanan gratis, atau hadiah eksklusif member.',
    highlights: ['Poin tiap kunjungan & transaksi', 'Tukar poin jadi diskon layanan', 'Tier member: Silver, Gold, Platinum'],
  },
  {
    id: 'feat-chat',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <path d="M8 8h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H14l-9 8V11a3 3 0 0 1 3-3z" fill="url(#featGrad4)" opacity="0.15"/>
        <path d="M8 8h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H14l-9 8V11a3 3 0 0 1 3-3z" stroke="url(#featGrad4)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="17" cy="22" r="2.5" fill="url(#featGrad4)"/>
        <circle cx="24" cy="22" r="2.5" fill="url(#featGrad4)"/>
        <circle cx="31" cy="22" r="2.5" fill="url(#featGrad4)"/>
        <defs>
          <linearGradient id="featGrad4" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#14b8a6"/>
            <stop offset="100%" stopColor="#16a34a"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    color: 'teal',
    title: 'Konsultasi Chat Dokter',
    tagline: 'Tanya Dokter Tanpa Antre',
    desc: 'Chat langsung dengan dokter hewan untuk pertanyaan ringan. Tidak perlu datang ke klinik hanya untuk pertanyaan sederhana.',
    highlights: ['Respons cepat dari dokter aktif', 'Konsultasi foto & video', 'Riwayat chat tersimpan permanen'],
  },
];

export default function FeatureSection() {
  const navigate = useNavigate();

  return (
    <section id="fitur" className="feature-section" aria-labelledby="feature-heading">
      <div className="feature-bg-orb feature-bg-orb--1" aria-hidden="true" />
      <div className="feature-bg-orb feature-bg-orb--2" aria-hidden="true" />

      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Fitur Unggulan
          </div>
          <h2 id="feature-heading" className="section-title">
            Satu Platform, Semua Kebutuhan{' '}
            <span className="section-title--gradient">Kelola Hewan Peliharaanmu</span>
          </h2>
          <p className="section-subtitle">
            Dirancang khusus untuk pemilik hewan modern — fitur lengkap yang membuat
            merawat hewan kesayangan jadi lebih mudah, teratur, dan menyenangkan.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="feature-grid" role="list">
          {FEATURES.map((feat, i) => (
            <article
              key={feat.id}
              id={feat.id}
              className={`feature-card feature-card--${feat.color} scroll-animate`}
              style={{ animationDelay: `${i * 0.12}s` }}
              role="listitem"
            >
              {/* Icon */}
              <div className={`feature-card__icon-bg feature-card__icon-bg--${feat.color}`} aria-hidden="true">
                {feat.icon}
              </div>

              {/* Tagline */}
              <div className={`feature-card__tagline feature-card__tagline--${feat.color}`}>
                {feat.tagline}
              </div>

              {/* Title + Desc */}
              <h3 className="feature-card__title">{feat.title}</h3>
              <p className="feature-card__desc">{feat.desc}</p>

              {/* Highlights */}
              <ul className="feature-card__highlights" role="list">
                {feat.highlights.map((h) => (
                  <li key={h} className="feature-card__highlight">
                    <svg
                      width="14" height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`feature-card__check feature-card__check--${feat.color}`}
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Corner decoration */}
              <div className={`feature-card__deco feature-card__deco--${feat.color}`} aria-hidden="true" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="feature-bottom-cta scroll-animate">
          <p className="feature-bottom-cta__text">
            Semua fitur ini tersedia <strong>gratis</strong> untuk setiap member PetCare Clinic
          </p>
          <button
            id="feature-cta-register"
            className="guest-btn guest-btn--primary guest-btn--lg"
            onClick={() => navigate('/register')}
          >
            Daftar & Akses Semua Fitur
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
