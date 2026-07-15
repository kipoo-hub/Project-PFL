import React from 'react';

const PROBLEMS = [
  {
    id: 'problem-rekam',
    icon: '📂',
    title: 'Riwayat Kesehatan Hewan Tidak Tercatat',
    desc: 'Setiap kunjungan seperti dari awal lagi — dokter tidak tahu riwayat sebelumnya dan pemilik kesulitan mengingat jadwal vaksin atau obat yang pernah diberikan.',
  },
  {
    id: 'problem-booking',
    icon: '⏳',
    title: 'Antri Lama Tanpa Kepastian Waktu',
    desc: 'Datang ke klinik tanpa tahu kapan giliran tiba. Hewan stres menunggu lama, dan pemilik tidak bisa memperkirakan kapan bisa kembali ke aktivitas.',
  },
  {
    id: 'problem-loyalty',
    icon: '💸',
    title: 'Tidak Ada Apresiasi untuk Pelanggan Setia',
    desc: 'Sudah sering berkunjung tapi tidak ada reward, poin, atau manfaat apapun. Pelanggan setia diperlakukan sama seperti pengunjung baru.',
  },
];

const SOLUTIONS = [
  {
    icon: '📋',
    title: 'Rekam Medis Digital Terpusat',
    desc: 'Semua riwayat kesehatan, vaksinasi, dan resep tersimpan rapi. Dokter bisa langsung melihat histori lengkap — tidak perlu cerita ulang.',
    color: 'green',
  },
  {
    icon: '📅',
    title: 'Booking Online 24 Jam',
    desc: 'Pesan jadwal kapan saja dari HP. Sistem notifikasi otomatis memberitahu saat giliran Anda hampir tiba.',
    color: 'blue',
  },
  {
    icon: '🏆',
    title: 'Program Poin & Membership Gratis',
    desc: 'Setiap kunjungan mengumpulkan poin. Tukarkan dengan diskon layanan, grooming gratis, atau hadiah eksklusif member.',
    color: 'teal',
  },
];

export default function ProblemSolutionSection() {
  return (
    <section id="masalah" className="problem-section" aria-labelledby="problem-heading">
      {/* Background decoration */}
      <div className="problem-bg-deco" aria-hidden="true" />

      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Kenali Masalahnya
          </div>
          <h2 id="problem-heading" className="section-title">
            Masalah yang Sering Dialami{' '}
            <span className="section-title--gradient">Pemilik Hewan</span>
          </h2>
          <p className="section-subtitle">
            Kami memahami tantangan nyata Anda. Itulah mengapa PetCare Clinic hadir
            dengan solusi yang tepat sasaran — bukan sekadar klinik biasa.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="problem-grid scroll-animate" role="list">
          {PROBLEMS.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              className="problem-card"
              style={{ animationDelay: `${i * 0.12}s` }}
              role="listitem"
            >
              <div className="problem-card__icon-wrap" aria-hidden="true">
                <span className="problem-card__icon">{p.icon}</span>
                <div className="problem-card__icon-x" aria-hidden="true">✕</div>
              </div>
              <h3 className="problem-card__title">{p.title}</h3>
              <p className="problem-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Transition Arrow */}
        <div className="problem-arrow scroll-animate" aria-hidden="true">
          <div className="problem-arrow__line" />
          <div className="problem-arrow__badge">Solusi PetCare Clinic</div>
          <div className="problem-arrow__line" />
        </div>

        {/* Solution Cards */}
        <div className="solution-grid scroll-animate" role="list">
          {SOLUTIONS.map((s, i) => (
            <div
              key={s.title}
              className={`solution-card solution-card--${s.color}`}
              style={{ animationDelay: `${i * 0.12}s` }}
              role="listitem"
            >
              <div className={`solution-card__icon-wrap solution-card__icon-wrap--${s.color}`} aria-hidden="true">
                <span className="solution-card__icon">{s.icon}</span>
              </div>
              <div className="solution-card__check-badge" aria-label="Solusi tersedia">✓</div>
              <h3 className="solution-card__title">{s.title}</h3>
              <p className="solution-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
