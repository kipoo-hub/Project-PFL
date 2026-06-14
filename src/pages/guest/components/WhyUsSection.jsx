import React from 'react';

const ADVANTAGES = [
  {
    id: 'dokter',
    icon: '👨‍⚕️',
    title: 'Dokter Berpengalaman',
    description:
      'Tim dokter hewan profesional dan bersertifikat dengan pengalaman lebih dari 10 tahun menangani berbagai jenis hewan peliharaan.',
    highlights: ['Spesialis Terlatih', 'Bersertifikat Resmi', '10+ Tahun Pengalaman'],
  },
  {
    id: 'buka',
    icon: '🕐',
    title: 'Buka 7 Hari Seminggu',
    description:
      'Siap melayani setiap hari termasuk hari libur nasional. Karena darurat medis tidak mengenal hari libur.',
    highlights: ['Buka Setiap Hari', 'Termasuk Hari Libur', '08:00 – 21:00 WIB'],
  },
  {
    id: 'kasih',
    icon: '❤️',
    title: 'Penanganan Penuh Kasih',
    description:
      'Kami memperlakukan setiap hewan seperti keluarga sendiri — dengan kelembutan, perhatian, dan dedikasi penuh.',
    highlights: ['Pendekatan Humanis', 'Lingkungan Nyaman', 'Care dengan Hati'],
  },
];

const TESTIMONIALS = [
  {
    id: 'testi-1',
    name: 'Sarah Amelia',
    pet: 'Pemilik Kucing Persia',
    avatar: '👩',
    text: 'Pelayanan luar biasa! Dokternya sangat ramah dan profesional. Kucingku sembuh dengan cepat. Sangat direkomendasikan!',
    rating: 5,
  },
  {
    id: 'testi-2',
    name: 'Budi Santoso',
    pet: 'Pemilik Golden Retriever',
    avatar: '👨',
    text: 'Sudah 3 tahun membawa anjing saya ke sini. Fasilitas lengkap, dokternya berpengalaman, dan harganya sangat terjangkau.',
    rating: 5,
  },
  {
    id: 'testi-3',
    name: 'Dewi Rahma',
    pet: 'Pemilik Kelinci & Hamster',
    avatar: '👩‍🦱',
    text: 'Klinik terbaik di kota! Penanganannya cepat dan tepat. Stafnya ramah dan sabar menjelaskan kondisi hewan peliharaan saya.',
    rating: 5,
  },
];

export default function WhyUsSection() {
  return (
    <section id="tentang" className="whyus-section" aria-labelledby="whyus-heading">
      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Mengapa Memilih Kami
          </div>
          <h2 id="whyus-heading" className="section-title">
            Kepercayaan Anda Adalah{' '}
            <span className="section-title--gradient">Prioritas Utama</span>
          </h2>
          <p className="section-subtitle">
            Lebih dari sekadar klinik hewan — kami adalah mitra kesehatan terpercaya untuk hewan peliharaan kesayangan Anda.
          </p>
        </div>

        {/* Advantage Cards */}
        <div className="whyus-grid" role="list">
          {ADVANTAGES.map((adv, i) => (
            <div
              key={adv.id}
              id={`whyus-card-${adv.id}`}
              className="whyus-card scroll-animate"
              style={{ animationDelay: `${i * 0.15}s` }}
              role="listitem"
            >
              <div className="whyus-card__icon-wrap" aria-hidden="true">
                <span className="whyus-card__icon">{adv.icon}</span>
                <div className="whyus-card__icon-ring" />
              </div>

              <h3 className="whyus-card__title">{adv.title}</h3>
              <p className="whyus-card__desc">{adv.description}</p>

              <ul className="whyus-card__highlights" role="list">
                {adv.highlights.map((h) => (
                  <li key={h} className="whyus-card__highlight">
                    <svg className="whyus-card__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              <div className="whyus-card__number" aria-hidden="true">0{i + 1}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="whyus-divider" aria-hidden="true" />

        {/* Testimonials */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Testimoni Klien
          </div>
          <h2 className="section-title">
            Apa Kata Mereka?
          </h2>
        </div>

        <div className="testi-grid" role="list">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.id}
              id={t.id}
              className="testi-card scroll-animate"
              style={{ animationDelay: `${i * 0.12}s` }}
              role="listitem"
            >
              {/* Stars */}
              <div className="testi-stars" aria-label={`Rating ${t.rating} dari 5`}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <span key={si} className="testi-star" aria-hidden="true">⭐</span>
                ))}
              </div>
              <p className="testi-text">"{t.text}"</p>
              <footer className="testi-author">
                <div className="testi-avatar" aria-hidden="true">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-pet">{t.pet}</div>
                </div>
              </footer>
              {/* Quote mark */}
              <div className="testi-quote-mark" aria-hidden="true">"</div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
