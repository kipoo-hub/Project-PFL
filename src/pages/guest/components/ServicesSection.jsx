import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  {
    id: 'konsultasi',
    emoji: '🩺',
    title: 'Konsultasi Dokter Hewan',
    description:
      'Konsultasi langsung dengan dokter hewan berpengalaman untuk diagnosis dan penanganan terbaik.',
    color: 'green',
    tag: 'Populer',
    duration: '30-60 menit',
    price: 'Rp 75.000',
    checklist: ["Pemeriksaan fisik", "Diagnosis", "Resep obat", "Saran perawatan lanjutan"],
    fullDescription: [
      "Layanan Konsultasi Dokter Hewan di PetCare Clinic memberikan kenyamanan maksimal bagi pemilik hewan untuk mendiskusikan berbagai keluhan kesehatan peliharaan. Tim dokter kami yang berpengalaman akan melakukan pemeriksaan secara menyeluruh dan sabar.",
      "Dengan didukung oleh peralatan diagnosis yang modern, kami memastikan diagnosis yang tepat untuk menunjang kesehatan optimal hewan kesayangan Anda. Dokter kami juga akan memberikan edukasi dan saran perawatan harian pasca konsultasi."
    ]
  },
  {
    id: 'vaksinasi',
    emoji: '💉',
    title: 'Vaksinasi',
    description:
      'Program vaksinasi lengkap untuk menjaga kesehatan dan imunitas hewan peliharaanmu.',
    color: 'blue',
    tag: null,
    duration: '15-30 menit',
    price: 'Rp 50.000',
    checklist: ["Vaksin core & non-core", "Sertifikat vaksin", "Reminder jadwal berikutnya"],
    fullDescription: [
      "Program vaksinasi dirancang khusus untuk melindungi hewan peliharaan Anda dari berbagai serangan penyakit menular yang berbahaya seperti parvovirus, rabies, dan distemper. Setiap sesi vaksinasi dimulai dengan pemeriksaan fisik lengkap untuk memastikan kondisi hewan benar-benar sehat.",
      "Setelah mendapatkan suntikan vaksin, Anda akan mendapatkan sertifikat vaksinasi resmi serta jadwal pengingat vaksin berikutnya dari sistem member kami. Imunitas yang baik adalah kunci umur panjang peliharaan Anda."
    ]
  },
  {
    id: 'grooming',
    emoji: '✂️',
    title: 'Grooming',
    description:
      'Layanan grooming profesional agar hewan peliharaanmu selalu bersih, ripi, dan sehat.',
    color: 'teal',
    tag: null,
    duration: '1-3 jam',
    price: 'Rp 80.000',
    checklist: ["Mandi & blow dry", "Potong kuku", "Bersihkan telinga", "Parfum hewan"],
    fullDescription: [
      "Layanan grooming kami tidak hanya membuat hewan peliharaan Anda terlihat cantik dan harum, tetapi juga menjaga kesehatan kulit dan bulunya. Kami menggunakan sampo berkualitas tinggi yang disesuaikan dengan jenis kulit peliharaan Anda.",
      "Staf groomer kami yang bersertifikat memperlakukan hewan dengan lembut dan sabar guna meminimalkan stres selama sesi mandi, pemotongan kuku, dan pembersihan telinga. Rasakan kesegaran maksimal untuk hewan kesayangan Anda."
    ]
  },
  {
    id: 'rawat-inap',
    emoji: '🏠',
    title: 'Rawat Inap / Penitipan',
    description:
      'Fasilitas rawat inap nyaman dengan pemantauan 24 jam oleh tenaga medis terlatih.',
    color: 'indigo',
    tag: '24/7',
    duration: 'Per malam',
    price: 'Rp 150.000/malam',
    checklist: ["Kandang nyaman", "Makan 3x sehari", "Pemantauan 24 jam", "Laporan harian ke pemilik"],
    fullDescription: [
      "Kami menawarkan penginapan yang aman dan nyaman bagi peliharaan Anda saat Anda harus bepergian atau ketika peliharaan membutuhkan pengawasan medis intensif. Setiap kandang didesain luas, bersih, dan dilengkapi dengan pengatur suhu ruangan.",
      "Staf kami memantau kondisi hewan secara berkala selama 24 jam penuh dan memberikan laporan harian berupa foto/video kepada Anda. Makanan premium dan perhatian penuh kasih sayang akan membuat peliharaan merasa seperti di rumah sendiri."
    ]
  },
  {
    id: 'operasi',
    emoji: '🔬',
    title: 'Operasi / Tindakan Medis',
    description:
      'Tindakan bedah dan medis dengan peralatan modern dan dokter hewan bersertifikat.',
    color: 'violet',
    tag: null,
    duration: 'Tergantung tindakan',
    price: 'Rp 500.000',
    checklist: ["Anestesi", "Tindakan operasi", "Pemulihan pasca operasi", "Obat-obatan"],
    fullDescription: [
      "Tindakan bedah di PetCare Clinic dilakukan di bawah standar operasional medis yang sangat ketat untuk menjamin keselamatan pasien. Tim bedah kami berpengalaman dalam menangani bedah umum, ortopedi, maupun sterilisasi.",
      "Kami menggunakan peralatan anestesi modern dan pemantauan detak jantung real-time selama proses operasi. Setelah tindakan, hewan akan ditempatkan di ruang pemulihan khusus pasca operasi dengan pengawasan penuh oleh tim medis kami."
    ]
  },
  {
    id: 'toko',
    emoji: '🛒',
    title: 'Toko / Produk Pet Care',
    description:
      'Tersedia berbagai produk perawatan, makanan, dan suplemen berkualitas untuk hewan peliharaanmu.',
    color: 'orange',
    tag: 'Baru',
    duration: '08:00 - 21:00 WIB',
    price: 'Tergantung produk',
    checklist: ["Makanan premium", "Suplemen kesehatan", "Aksesoris hewan", "Obat-obatan"],
    fullDescription: [
      "Toko pet care kami menyediakan kebutuhan harian terlengkap untuk menjaga kualitas hidup hewan peliharaan Anda. Kami menyediakan makanan premium dari merek terpercaya, suplemen vitamin, serta aksesoris berkualitas seperti kalung, mainan, dan tempat tidur.",
      "Seluruh produk yang kami jual telah melalui kurasi ketat untuk menjamin keamanan bagi peliharaan. Apotek kami juga menyediakan obat-obatan resep dokter yang lengkap agar Anda tidak perlu kesulitan mencari obat pasca konsultasi."
    ]
  },
];

const DELAYS = ['0ms', '150ms', '300ms', '150ms', '300ms', '450ms'];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

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
              style={{ transitionDelay: DELAYS[index], animationDelay: DELAYS[index] }}
              onClick={() => setSelectedService(service)}
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

              <button 
                className={`service-card__link service-card__link--${service.color}`} 
                aria-label={`Pelajari lebih lanjut tentang ${service.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedService(service);
                }}
              >
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

      {/* DETAIL MODAL LAYANAN */}
      <div 
        className={`detail-modal-overlay ${selectedService ? 'open' : ''}`} 
        onClick={() => setSelectedService(null)}
      >
        {selectedService && (
          <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="detail-modal-close" 
              onClick={() => setSelectedService(null)}
              aria-label="Tutup modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            
            {/* Header: Icon & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className={`service-card__icon-wrap service-card__icon-wrap--${selectedService.color}`} style={{ marginBottom: 0, flexShrink: 0 }}>
                <span className="service-card__emoji" style={{ fontSize: '2rem' }}>{selectedService.emoji}</span>
              </div>
              <h3 className="service-card__title" style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                {selectedService.title}
              </h3>
            </div>
            
            {/* Quick Details: Duration & Price */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--vet-gray-700)', fontWeight: 500, marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🕐</span> <strong>Durasi:</strong> {selectedService.duration}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💰</span> <strong>Mulai dari:</strong> {selectedService.price}
              </div>
            </div>
            
            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--vet-gray-600)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {selectedService.fullDescription.map((para, i) => (
                <p key={i} style={{ margin: 0 }}>{para}</p>
              ))}
            </div>
            
            {/* Inclusions */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--vet-gray-800)', margin: '0 0 8px 0' }}>
                Termasuk dalam Layanan:
              </h4>
              <ul className="detail-modal-checklist">
                {selectedService.checklist.map((item, i) => (
                  <li key={i} className="detail-modal-checkitem">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Actions */}
            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="guest-btn guest-btn--primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setSelectedService(null);
                  navigate('/member/register');
                }}
              >
                Buat Janji untuk Layanan Ini
              </button>
              <button
                className="guest-btn guest-btn--outline"
                style={{ borderColor: 'var(--vet-gray-300)' }}
                onClick={() => setSelectedService(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
