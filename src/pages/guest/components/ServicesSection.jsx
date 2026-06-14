import React from 'react';

const SERVICES = [
  {
    id: 'konsultasi',
    emoji: '🩺',
    title: 'Konsultasi Dokter Hewan',
    description:
      'Konsultasi langsung dengan dokter hewan berpengalaman untuk diagnosis dan penanganan terbaik.',
    color: 'green',
    tag: 'Populer',
  },
  {
    id: 'vaksinasi',
    emoji: '💉',
    title: 'Vaksinasi',
    description:
      'Program vaksinasi lengkap untuk menjaga kesehatan dan imunitas hewan peliharaanmu.',
    color: 'blue',
    tag: null,
  },
  {
    id: 'grooming',
    emoji: '✂️',
    title: 'Grooming',
    description:
      'Layanan grooming profesional agar hewan peliharaanmu selalu bersih, rapi, dan sehat.',
    color: 'teal',
    tag: null,
  },
  {
    id: 'rawat-inap',
    emoji: '🏠',
    title: 'Rawat Inap / Penitipan',
    description:
      'Fasilitas rawat inap nyaman dengan pemantauan 24 jam oleh tenaga medis terlatih.',
    color: 'indigo',
    tag: '24/7',
  },
  {
    id: 'operasi',
    emoji: '🔬',
    title: 'Operasi / Tindakan Medis',
    description:
      'Tindakan bedah dan medis dengan peralatan modern dan dokter hewan bersertifikat.',
    color: 'violet',
    tag: null,
  },
  {
    id: 'toko',
    emoji: '🛒',
    title: 'Toko / Produk Pet Care',
    description:
      'Tersedia berbagai produk perawatan, makanan, dan suplemen berkualitas untuk hewan peliharaanmu.',
    color: 'orange',
    tag: 'Baru',
  },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="services-section" aria-labelledby="services-heading">
      <div className="services-bg-deco" aria-hidden="true" />

      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Layanan Kami
          </div>
          <h2 id="services-heading" className="section-title">
            Semua Kebutuhan Hewan
            <br />
            <span className="section-title--gradient">Peliharaanmu di Sini</span>
          </h2>
          <p className="section-subtitle">
            Kami menyediakan layanan medis dan perawatan lengkap dengan standar tertinggi
            untuk menjaga kesehatan dan kebahagiaan hewan peliharaanmu.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid" role="list">
          {SERVICES.map((service, index) => (
            <article
              key={service.id}
              id={`service-card-${service.id}`}
              className={`service-card service-card--${service.color} scroll-animate`}
              style={{ animationDelay: `${index * 0.1}s` }}
              role="listitem"
            >
              {service.tag && (
                <div className={`service-card__tag service-card__tag--${service.color}`}>
                  {service.tag}
                </div>
              )}

              <div className={`service-card__icon-wrap service-card__icon-wrap--${service.color}`}>
                <span className="service-card__emoji" aria-hidden="true">{service.emoji}</span>
              </div>

              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.description}</p>

              <button className={`service-card__link service-card__link--${service.color}`} aria-label={`Pelajari lebih lanjut tentang ${service.title}`}>
                Pelajari Lebih Lanjut
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              {/* Decorative corner */}
              <div className={`service-card__corner service-card__corner--${service.color}`} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
