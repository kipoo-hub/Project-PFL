import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';
import './member-dashboard.css';

// ── Mock Data ─────────────────────────────────────────────────
const PETS = [
  { id: 1, name: 'Buddy', species: 'Anjing Golden Retriever', age: '3 tahun', weight: '28 kg', type: 'dog', chips: ['Vaksin ✓', 'Sterilisasi ✓'] },
  { id: 2, name: 'Luna', species: 'Kucing Persia', age: '2 tahun', weight: '4.2 kg', type: 'cat', chips: ['Vaksin ✓'] },
  { id: 3, name: 'Mochi', species: 'Kelinci Mini', age: '1 tahun', weight: '1.8 kg', type: 'rabbit', chips: ['Sehat ✓'] },
];

const APPOINTMENTS = [
  { id: 1, day: '20', month: 'Jun', service: 'Vaksinasi Tahunan — Buddy', doctor: 'drh. Sarah Amelia', time: '09:00 WIB', status: 'confirmed' },
  { id: 2, day: '25', month: 'Jun', service: 'Grooming — Luna', doctor: 'Tim Grooming', time: '13:30 WIB', status: 'upcoming' },
  { id: 3, day: '02', month: 'Jul', service: 'Konsultasi Rutin — Mochi', doctor: 'drh. Rizal F.', time: '11:00 WIB', status: 'pending' },
];

const ACTIVITIES = [
  { id: 1, icon: '🩺', title: 'Konsultasi Buddy — drh. Sarah Amelia', meta: '5 Jun 2024 · Diagnosis: Sehat, tidak ada keluhan', time: '5 hari lalu' },
  { id: 2, icon: '💉', title: 'Vaksinasi Rabies — Luna', meta: '28 Mei 2024 · Vaksin dosis ke-2 selesai', time: '12 hari lalu' },
  { id: 3, icon: '✂️', title: 'Grooming — Buddy', meta: '20 Mei 2024 · Full grooming, mandi & potong kuku', time: '20 hari lalu' },
  { id: 4, icon: '🔬', title: 'Cek Darah Rutin — Luna', meta: '10 Mei 2024 · Semua hasil normal', time: '30 hari lalu' },
];

export default function MemberDashboard() {
  const { member } = useMemberAuth();
  const navigate = useNavigate();
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    crmState.init();
    setVaccines(crmState.getVaccines());

    const handleStorage = () => {
      setVaccines(crmState.getVaccines());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const memberVaccines = vaccines.filter(v => 
    (member?.email && v.email?.toLowerCase() === member.email.toLowerCase()) ||
    (member?.name && v.ownerName?.toLowerCase() === member.name.toLowerCase()) ||
    (member?.email === 'demo@email.com' && v.email === 'budi@email.com')
  );

  const dueVaccines = memberVaccines.filter(v => v.daysRemaining <= 7 && v.status === 'Belum Diingatkan');

  const firstName = member?.name?.split(' ')[0] || 'Member';
  const petEmoji = { dog: '🐕', cat: '🐈', rabbit: '🐇' };
  const badgeClass = { confirmed: 'md-appt-badge--confirmed', upcoming: 'md-appt-badge--upcoming', pending: 'md-appt-badge--pending' };
  const badgeLabel = { confirmed: 'Dikonfirmasi', upcoming: 'Segera', pending: 'Menunggu' };

  return (
    <div>
      {/* Page Header */}
      <div className="md-page-header">
        <h1 className="md-page-header__welcome">
          Selamat datang, {firstName}! 👋
        </h1>
        <div className="md-page-header__sub">
          <span>Senin, 14 Juni 2024</span>
          <div className="md-badge-active">
            <div className="md-badge-active__dot" aria-hidden="true" />
            Member Aktif ✓
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="md-summary-grid" role="list" aria-label="Ringkasan akun">
        {[
          { icon: '🐾', value: '3', label: 'Hewan Terdaftar', sub: 'Anjing, Kucing, Kelinci', color: 'green' },
          { icon: '📅', value: '3', label: 'Janji Temu', sub: 'Terdekat: 20 Jun', color: 'blue' },
          { icon: '💉', value: dueVaccines.length.toString(), label: 'Vaksin Jatuh Tempo', sub: dueVaccines[0] ? `${dueVaccines[0].petName} — ${dueVaccines[0].dueDate}` : 'Tidak ada vaksin terdekat', color: 'orange' },
          { icon: '🔔', value: dueVaccines.length.toString(), label: 'Notifikasi Baru', sub: `${dueVaccines.length} pengingat aktif`, color: 'red' },
        ].map((card) => (
          <div key={card.label} className="md-summary-card" role="listitem">
            <div className={`md-summary-card__icon md-summary-card__icon--${card.color}`} aria-hidden="true">
              {card.icon}
            </div>
            <div>
              <div className="md-summary-card__value">{card.value}</div>
              <div className="md-summary-card__label">{card.label}</div>
              <div className="md-summary-card__sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pets */}
      <section className="md-section" aria-labelledby="pets-heading" style={{ marginTop: 24 }}>
        <div className="md-section__header">
          <h2 id="pets-heading" className="md-section__title">
            <span className="md-section__title-icon" aria-hidden="true">🐾</span>
            Hewan Peliharaan Saya
          </h2>
          <button id="btn-lihat-semua-hewan" className="md-section__action">
            Lihat Semua
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="md-pets-grid" role="list">
          {PETS.map((pet) => (
            <article key={pet.id} id={`pet-card-${pet.id}`} className="md-pet-card" role="listitem">
              <div className={`md-pet-card__image md-pet-card__image--${pet.type}`} aria-label={`Foto ${pet.name}`}>
                <span aria-hidden="true">{petEmoji[pet.type]}</span>
                <div className="md-pet-card__status" title="Sehat" />
              </div>
              <div className="md-pet-card__body">
                <div className="md-pet-card__name">{pet.name}</div>
                <div className="md-pet-card__species">{pet.species} · {pet.age}</div>
                <div className="md-pet-card__chips">
                  {pet.chips.map((c) => (
                    <span key={c} className="md-pet-card__chip">{c}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {/* Add pet */}
          <div className="md-pet-card--add" role="button" tabIndex={0} id="btn-tambah-hewan" aria-label="Tambah hewan peliharaan baru">
            <span style={{ fontSize: '2rem' }} aria-hidden="true">➕</span>
            <span>Tambah Hewan</span>
          </div>
        </div>
      </section>

      {/* Two-column: Appointments + Activity */}
      <div className="md-content-grid" style={{ marginTop: 24 }}>
        {/* Appointments */}
        <section className="md-section" aria-labelledby="appt-heading">
          <div className="md-section__header">
            <h2 id="appt-heading" className="md-section__title">
              <span className="md-section__title-icon" aria-hidden="true">📅</span>
              Janji Temu Terdekat
            </h2>
            <button id="btn-buat-janji" className="md-section__action">
              + Buat Janji
            </button>
          </div>
          <div className="md-appointments" role="list">
            {APPOINTMENTS.map((appt) => (
              <article key={appt.id} id={`appt-card-${appt.id}`} className="md-appt-card" role="listitem">
                <div className="md-appt-card__date">
                  <div className="md-appt-card__day">{appt.day}</div>
                  <div className="md-appt-card__month">{appt.month}</div>
                </div>
                <div className="md-appt-card__info">
                  <div className="md-appt-card__service">{appt.service}</div>
                  <div className="md-appt-card__meta">
                    <span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {appt.time}
                    </span>
                    <span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {appt.doctor}
                    </span>
                  </div>
                </div>
                <span className={`md-appt-badge ${badgeClass[appt.status]}`}>
                  {badgeLabel[appt.status]}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Activity */}
        <section className="md-section" aria-labelledby="activity-heading">
          <div className="md-section__header">
            <h2 id="activity-heading" className="md-section__title">
              <span className="md-section__title-icon" aria-hidden="true">⏱️</span>
              Aktivitas Terkini
            </h2>
          </div>
          <div className="md-activity-list" role="list">
            {ACTIVITIES.map((act) => (
              <div key={act.id} id={`activity-${act.id}`} className="md-activity-item" role="listitem">
                <div className="md-activity-icon" aria-hidden="true">{act.icon}</div>
                <div className="md-activity-info">
                  <div className="md-activity-title">{act.title}</div>
                  <div className="md-activity-meta">{act.meta}</div>
                </div>
                <div className="md-activity-time">{act.time}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
