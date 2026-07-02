import React from 'react';
import { useNavigate } from 'react-router-dom';

const BENEFITS = [
  { icon: '📅', title: 'Booking janji temu online', desc: 'Pesan jadwal dokter kapan saja, di mana saja — 24 jam.' },
  { icon: '📋', title: 'Rekam medis digital', desc: 'Akses riwayat kesehatan hewan peliharaanmu setiap saat.' },
  { icon: '🔔', title: 'Reminder vaksinasi otomatis', desc: 'Tidak akan ada jadwal vaksin yang terlewat lagi.' },
  { icon: '💬', title: 'Chat langsung dengan dokter', desc: 'Konsultasi ringan via chat tanpa harus datang ke klinik.' },
  { icon: '🧾', title: 'Riwayat kunjungan lengkap', desc: 'Semua catatan kunjungan tersimpan rapi di satu tempat.' },
];

export default function MembershipSection() {
  const navigate = useNavigate();

  return (
    <section
      id="membership"
      className="membership-section"
      aria-labelledby="membership-heading"
    >
      <div className="membership-bg-deco--top" aria-hidden="true" />
      <div className="membership-bg-deco--bottom" aria-hidden="true" />

      <div className="guest-container">
        <div className="membership-inner scroll-animate">
          {/* ── Left: text + benefits ── */}
          <div className="membership-text">
            <div className="section-eyebrow">
              <div className="section-eyebrow__dot" aria-hidden="true" />
              Member Gratis
            </div>

            <h2 id="membership-heading" className="section-title" style={{ textAlign: 'left', margin: '0 0 16px' }}>
              Bergabung Sebagai Member —{' '}
              <span className="section-title--gradient">Gratis!</span>
            </h2>

            <p className="membership-desc">
              Daftar sekarang dan nikmati kemudahan mengelola kesehatan hewan
              peliharaanmu. Semua fitur member tersedia tanpa biaya apapun.
            </p>

            <ul className="membership-benefits" role="list">
              {BENEFITS.map((b) => (
                <li key={b.title} className="membership-benefit" role="listitem">
                  <div className="membership-benefit__icon" aria-hidden="true">{b.icon}</div>
                  <div>
                    <div className="membership-benefit__title">
                      <svg
                        className="membership-benefit__check"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {b.title}
                    </div>
                    <div className="membership-benefit__desc">{b.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="membership-cta-row">
              <button
                id="membership-cta-register"
                className="guest-btn guest-btn--primary guest-btn--lg"
                onClick={() => navigate('/register')}
              >
                Daftar Gratis Sekarang
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button
                id="membership-cta-login"
                className="guest-btn guest-btn--outline"
                onClick={() => navigate('/login')}
              >
                Sudah punya akun? Masuk
              </button>
            </div>

            <p className="membership-note">
              🔒 Gratis selamanya · Tidak perlu kartu kredit · Daftar dalam 30 detik
            </p>
          </div>

          {/* ── Right: visual mockup ── */}
          <div className="membership-visual scroll-animate" style={{ animationDelay: '0.2s' }} aria-hidden="true">
            <div className="membership-mockup">
              {/* Header */}
              <div className="membership-mockup__header">
                <div className="membership-mockup__avatar">BS</div>
                <div>
                  <div className="membership-mockup__name">Budi Santoso</div>
                  <div className="membership-mockup__badge">✓ Member Aktif</div>
                </div>
                <div className="membership-mockup__notif">🔔</div>
              </div>

              {/* Stats row */}
              <div className="membership-mockup__stats">
                {[
                  { v: '3', l: 'Hewan' },
                  { v: '2', l: 'Janji' },
                  { v: '12', l: 'Kunjungan' },
                ].map((s) => (
                  <div key={s.l} className="membership-mockup__stat">
                    <span className="membership-mockup__stat-val">{s.v}</span>
                    <span className="membership-mockup__stat-lbl">{s.l}</span>
                  </div>
                ))}
              </div>

              {/* Pets */}
              <div className="membership-mockup__section">
                <div className="membership-mockup__section-title">Hewan Peliharaan</div>
                <div className="membership-mockup__pets">
                  {[
                    { emoji: '🐕', name: 'Buddy', type: 'Golden Retriever' },
                    { emoji: '🐈', name: 'Luna', type: 'Kucing Persia' },
                  ].map((p) => (
                    <div key={p.name} className="membership-mockup__pet">
                      <span className="membership-mockup__pet-emoji">{p.emoji}</span>
                      <div>
                        <div className="membership-mockup__pet-name">{p.name}</div>
                        <div className="membership-mockup__pet-type">{p.type}</div>
                      </div>
                      <div className="membership-mockup__pet-dot" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next appt */}
              <div className="membership-mockup__section">
                <div className="membership-mockup__section-title">Janji Temu Berikutnya</div>
                <div className="membership-mockup__appt">
                  <div className="membership-mockup__appt-date">
                    <div className="membership-mockup__appt-day">20</div>
                    <div className="membership-mockup__appt-month">Jun</div>
                  </div>
                  <div>
                    <div className="membership-mockup__appt-title">Vaksinasi Buddy</div>
                    <div className="membership-mockup__appt-meta">09:00 · drh. Sarah Amelia</div>
                  </div>
                  <div className="membership-mockup__appt-tag">Besok</div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="membership-float membership-float--1">🏆 Top Member</div>
              <div className="membership-float membership-float--2">💚 Gratis!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
