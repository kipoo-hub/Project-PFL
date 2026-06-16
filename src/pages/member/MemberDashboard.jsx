import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';
import './member-dashboard.css';

// Helpers
const getAge = (birthDateStr) => {
  if (!birthDateStr) return 'Umur tidak diketahui';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }
  
  if (ageYears > 0) {
    return `${ageYears} tahun` + (ageMonths > 0 ? ` ${ageMonths} bulan` : '');
  }
  return `${ageMonths} bulan`;
};

const getDaysAgoString = (dateStr) => {
  const diffTime = new Date() - new Date(dateStr);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Mendatang';
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  return `${diffDays} hari lalu`;
};

const getApptDateParts = (dateStr) => {
  try {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: months[d.getMonth()]
    };
  } catch (_) {
    return { day: '00', month: '---' };
  }
};

const formatCurrentDate = () => {
  const d = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function MemberDashboard() {
  const { member } = useMemberAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  const loadDashboardData = () => {
    crmState.init();
    const email = member?.email || 'demo@email.com';
    
    // Load pets
    const memberPets = crmState.getMemberPets(email);
    setPets(memberPets);

    // Load appointments
    const allAppts = crmState.getMemberAppointments(email);
    const upcoming = allAppts.filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi');
    setAppointments(upcoming);

    // Load activities (medical records)
    const records = crmState.getMemberMedicalRecords(email);
    const mappedActivities = records.slice(0, 5).map((r, index) => {
      let icon = '🩺';
      if (r.diagnosis.toLowerCase().includes('vaksin')) icon = '💉';
      if (r.diagnosis.toLowerCase().includes('grooming')) icon = '✂️';
      if (r.diagnosis.toLowerCase().includes('steril')) icon = '✂️';
      return {
        id: r.id || index,
        icon,
        title: `${r.diagnosis} — ${r.petName}`,
        meta: `${r.date} · Tindakan: ${r.action}`,
        time: getDaysAgoString(r.date)
      };
    });
    setActivities(mappedActivities);

    // Load vaccines
    setVaccines(crmState.getVaccines());
  };

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('crm_change', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('crm_change', handleUpdate);
    };
  }, [member]);

  const memberVaccines = vaccines.filter(v => 
    (member?.email && v.email?.toLowerCase() === member.email.toLowerCase()) ||
    (member?.name && v.ownerName?.toLowerCase() === member.name.toLowerCase()) ||
    (member?.email === 'demo@email.com' && v.email === 'budi@email.com')
  );

  const dueVaccines = memberVaccines.filter(v => v.daysRemaining <= 7 && v.status === 'Belum Diingatkan');

  const firstName = member?.name?.split(' ')[0] || 'Member';
  const petEmoji = { 'Anjing': '🐕', 'Kucing': '🐈', 'Kelinci': '🐇', 'Burung': '🦜' };
  const badgeClass = { 'Dikonfirmasi': 'md-appt-badge--confirmed', 'Menunggu': 'md-appt-badge--pending', 'Selesai': 'md-appt-badge--confirmed', 'Dibatalkan': 'md-appt-badge--upcoming' };

  // Summary logic
  const petNamesList = pets.map(p => p.nama).join(', ');
  const nextAppt = appointments[0];

  return (
    <div>
      {/* Page Header */}
      <div className="md-page-header">
        <h1 className="md-page-header__welcome">
          Selamat datang, {firstName}! 👋
        </h1>
        <div className="md-page-header__sub">
          <span>{formatCurrentDate()}</span>
          <div className="md-badge-active">
            <div className="md-badge-active__dot" aria-hidden="true" />
            Member Aktif ✓
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="md-summary-grid" role="list" aria-label="Ringkasan akun">
        {[
          { icon: '🐾', value: pets.length.toString(), label: 'Hewan Terdaftar', sub: petNamesList || 'Belum ada hewan', color: 'green' },
          { icon: '📅', value: appointments.length.toString(), label: 'Janji Temu', sub: nextAppt ? `Terdekat: ${nextAppt.date}` : 'Tidak ada janji terdekat', color: 'blue' },
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
              <div className="md-summary-card__sub" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{card.sub}</div>
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
          <button id="btn-lihat-semua-hewan" className="md-section__action" onClick={() => navigate('/member/hewan')}>
            Lihat Semua
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="md-pets-grid" role="list">
          {pets.map((pet) => (
            <article key={pet.id} id={`pet-card-${pet.id}`} className="md-pet-card" role="listitem" onClick={() => navigate(`/member/hewan/${pet.id}`)} style={{ cursor: 'pointer' }}>
              <div className={`md-pet-card__image md-pet-card__image--${(pet.spesies || 'anjing').toLowerCase() === 'anjing' ? 'dog' : (pet.spesies || 'kucing').toLowerCase() === 'kucing' ? 'cat' : 'rabbit'}`} aria-label={`Foto ${pet.nama}`}>
                <span aria-hidden="true">{petEmoji[pet.spesies] || '🐾'}</span>
                <div className="md-pet-card__status" style={{ backgroundColor: pet.status === 'Sehat' ? '#16a34a' : pet.status === 'Vaksin Jatuh Tempo' ? '#f97316' : '#ef4444' }} title={pet.status} />
              </div>
              <div className="md-pet-card__body">
                <div className="md-pet-card__name">{pet.nama}</div>
                <div className="md-pet-card__species">{pet.spesies} {pet.ras ? `(${pet.ras})` : ''} · {getAge(pet.tanggalLahir)}</div>
                <div className="md-pet-card__chips">
                  <span className="md-pet-card__chip">{pet.status}</span>
                  {pet.sterilisasi && <span className="md-pet-card__chip">Steril ✓</span>}
                </div>
              </div>
            </article>
          ))}
          {/* Add pet */}
          <div className="md-pet-card--add" role="button" tabIndex={0} id="btn-tambah-hewan" aria-label="Tambah hewan peliharaan baru" onClick={() => navigate('/member/hewan', { state: { openAddModal: true } })}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: '4px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
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
            <button id="btn-buat-janji" className="md-section__action" onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })}>
              + Buat Janji
            </button>
          </div>
          <div className="md-appointments" role="list">
            {appointments.length === 0 ? (
              <div className="md-appt-card" style={{ justifyContent: 'center', color: 'var(--md-gray-400)', padding: '24px 16px' }}>
                Tidak ada janji temu terdekat
              </div>
            ) : (
              appointments.map((appt) => {
                const dateParts = getApptDateParts(appt.date);
                return (
                  <article key={appt.id} id={`appt-card-${appt.id}`} className="md-appt-card" role="listitem">
                    <div className="md-appt-card__date">
                      <div className="md-appt-card__day">{dateParts.day}</div>
                      <div className="md-appt-card__month">{dateParts.month}</div>
                    </div>
                    <div className="md-appt-card__info">
                      <div className="md-appt-card__service">{appt.service} — {appt.petName}</div>
                      <div className="md-appt-card__meta">
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {appt.time} WIB
                        </span>
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {appt.doctor}
                        </span>
                      </div>
                    </div>
                    <span className={`md-appt-badge ${badgeClass[appt.status] || 'md-appt-badge--pending'}`}>
                      {appt.status}
                    </span>
                  </article>
                );
              })
            )}
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
            {activities.length === 0 ? (
              <div className="md-activity-item" style={{ justifyContent: 'center', color: 'var(--md-gray-400)', padding: '24px 16px' }}>
                Belum ada riwayat aktivitas medis
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} id={`activity-${act.id}`} className="md-activity-item" role="listitem">
                  <div className="md-activity-icon" aria-hidden="true">{act.icon}</div>
                  <div className="md-activity-info">
                    <div className="md-activity-title">{act.title}</div>
                    <div className="md-activity-meta">{act.meta}</div>
                  </div>
                  <div className="md-activity-time">{act.time}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
