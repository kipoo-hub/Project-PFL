import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    id: 'faq-member-gratis',
    question: 'Apakah pendaftaran member berbayar?',
    answer:
      'Tidak sama sekali! Pendaftaran member di Veterinario 100% gratis dan tidak ada biaya bulanan apapun. Cukup daftar dengan email, lengkapi profil, dan semua fitur member langsung bisa Anda nikmati — termasuk booking online, rekam medis digital, dan program poin.',
  },
  {
    id: 'faq-poin',
    question: 'Bagaimana cara mendapatkan poin membership?',
    answer:
      'Poin Anda bertambah otomatis setiap kali melakukan kunjungan ke klinik, melakukan booking layanan, atau menyelesaikan transaksi. Semakin sering berkunjung, semakin banyak poin yang terkumpul. Poin dapat ditukarkan dengan diskon layanan, grooming gratis, atau hadiah eksklusif lainnya sesuai tier member Anda (Silver, Gold, Platinum).',
  },
  {
    id: 'faq-booking',
    question: 'Bagaimana cara booking layanan klinik?',
    answer:
      'Sangat mudah! Setelah mendaftar dan login, masuk ke menu "Janji Temu", pilih layanan yang diinginkan (konsultasi, vaksinasi, grooming, dll.), pilih dokter dan tanggal/jam yang tersedia, lalu konfirmasi. Anda akan menerima notifikasi pengingat otomatis sebelum jadwal tiba. Tidak perlu telepon atau datang langsung!',
  },
  {
    id: 'faq-rekam-medis',
    question: 'Apakah rekam medis hewan peliharaan saya aman tersimpan?',
    answer:
      'Keamanan data adalah prioritas kami. Semua rekam medis tersimpan di server terenkripsi dengan standar keamanan industri. Hanya Anda dan dokter yang menangani yang dapat mengakses rekam medis hewan peliharaan Anda. Anda juga bisa mengunduh rekam medis kapan saja untuk keperluan pribadi.',
  },
  {
    id: 'faq-banyak-hewan',
    question: 'Bisa mendaftarkan lebih dari satu hewan peliharaan?',
    answer:
      'Tentu saja! Satu akun member dapat mengelola beberapa hewan peliharaan sekaligus. Setiap hewan memiliki profil dan rekam medis tersendiri. Jadi jika Anda memiliki anjing, kucing, dan kelinci, semuanya bisa dikelola dari satu akun yang sama dengan mudah.',
  },
  {
    id: 'faq-konsultasi',
    question: 'Apakah fitur chat dokter bisa digunakan kapan saja?',
    answer:
      'Fitur chat tersedia selama jam operasional klinik (Senin–Sabtu: 08:00–21:00, Minggu & Hari Libur: 09:00–18:00). Untuk keadaan darurat di luar jam operasional, Anda bisa menghubungi hotline darurat kami atau datang langsung ke klinik. Dokter kami akan merespons chat secepat mungkin selama jam aktif.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      id={faq.id}
      className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
    >
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${faq.id}-body`}
      >
        <span className="faq-item__question">{faq.question}</span>
        <span className="faq-item__icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`faq-item__chevron ${isOpen ? 'faq-item__chevron--open' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div
        id={`${faq.id}-body`}
        className="faq-item__body"
        role="region"
        aria-labelledby={faq.id}
        style={{ maxHeight: isOpen ? '400px' : '0' }}
      >
        <div className="faq-item__answer">
          <p>{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);
  const navigate = useNavigate();

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-bg-deco" aria-hidden="true" />

      <div className="guest-container">
        {/* Section Header */}
        <div className="section-header scroll-animate">
          <div className="section-eyebrow">
            <div className="section-eyebrow__dot" aria-hidden="true" />
            Pertanyaan Umum
          </div>
          <h2 id="faq-heading" className="section-title">
            Masih Ada{' '}
            <span className="section-title--gradient">Pertanyaan?</span>
          </h2>
          <p className="section-subtitle">
            Kami siapkan jawaban untuk pertanyaan yang paling sering kami terima.
            Tidak ketemu jawabannya? Hubungi kami langsung.
          </p>
        </div>

        {/* FAQ Layout */}
        <div className="faq-layout">
          {/* Accordion */}
          <div className="faq-accordion scroll-animate" role="list">
            {FAQS.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            ))}
          </div>

          {/* Sidebar Help Card */}
          <aside className="faq-sidebar scroll-animate" aria-label="Masih butuh bantuan?">
            <div className="faq-sidebar__icon" aria-hidden="true">💬</div>
            <h3 className="faq-sidebar__title">Masih Butuh Bantuan?</h3>
            <p className="faq-sidebar__desc">
              Tim kami siap membantu Anda melalui berbagai saluran komunikasi yang tersedia.
            </p>

            <div className="faq-sidebar__channels">
              <a
                href="https://wa.me/6282292707434"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-sidebar__channel"
                id="faq-whatsapp-link"
              >
                <div className="faq-sidebar__channel-icon faq-sidebar__channel-icon--wa">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <div className="faq-sidebar__channel-label">Chat WhatsApp</div>
                  <div className="faq-sidebar__channel-sub">Respons cepat</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="faq-sidebar__channel-arrow" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>

              <a
                href="mailto:hello@veterinario.id"
                className="faq-sidebar__channel"
                id="faq-email-link"
              >
                <div className="faq-sidebar__channel-icon faq-sidebar__channel-icon--email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="faq-sidebar__channel-label">Email</div>
                  <div className="faq-sidebar__channel-sub">hello@veterinario.id</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="faq-sidebar__channel-arrow" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </div>

            <div className="faq-sidebar__divider" />

            <button
              id="faq-cta-register"
              className="guest-btn guest-btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/register')}
            >
              Daftar Sekarang — Gratis!
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
