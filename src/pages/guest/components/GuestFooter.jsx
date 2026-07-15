import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../../assets/logo.png';
import '../guest.css';

export default function GuestFooter() {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const year = new Date().getFullYear();

  return (
    <footer id="kontak" className="guest-footer" role="contentinfo">
      <div className="guest-footer__top-bar" aria-hidden="true" />

      <div className="guest-container">
        <div className="guest-footer__grid">
          {/* Brand column */}
          <div className="guest-footer__brand">
            <div className="guest-footer__logo">
              <div className="guest-footer__logo-icon" aria-hidden="true">
                <img src={logoImg} alt="PetCare Clinic Logo" width="36" height="36" style={{ objectFit: 'contain', display: 'block' }} />
              </div>
              <span className="guest-footer__logo-text">PetCare Clinic</span>
            </div>
            <p className="guest-footer__brand-desc">
              Klinik hewan terpercaya dengan dokter berpengalaman. Kami hadir untuk memberikan
              perawatan terbaik dengan penuh kasih sayang untuk hewan peliharaan Anda.
            </p>

            {/* Social links */}
            <div className="guest-footer__social" aria-label="Media sosial">
              {[
                {
                  id: 'footer-instagram',
                  label: 'Instagram',
                  href: '#',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  ),
                },
                {
                  id: 'footer-facebook',
                  label: 'Facebook',
                  href: '#',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  ),
                },
                {
                  id: 'footer-whatsapp',
                  label: 'WhatsApp',
                  href: 'https://wa.me/62812345678',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.id}
                  id={social.id}
                  href={social.href}
                  className="guest-footer__social-link"
                  aria-label={social.label}
                  target={social.href !== '#' ? '_blank' : undefined}
                  rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Layanan column */}
          <nav className="guest-footer__col" aria-label="Layanan">
            <h3 className="guest-footer__col-title">Layanan</h3>
            <ul role="list">
              {[
                { label: 'Konsultasi Dokter', id: 'layanan' },
                { label: 'Vaksinasi', id: 'layanan' },
                { label: 'Grooming', id: 'layanan' },
                { label: 'Rawat Inap', id: 'layanan' },
                { label: 'Operasi Medis', id: 'layanan' },
                { label: 'Toko Pet Care', id: 'layanan' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    className="guest-footer__link"
                    onClick={() => handleScrollTo(item.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Informasi column */}
          <nav className="guest-footer__col" aria-label="Informasi">
            <h3 className="guest-footer__col-title">Informasi</h3>
            <ul role="list">
              {[
                { label: 'Tentang Kami', id: 'tentang' },
                { label: 'Tim Dokter', id: 'tentang' },
                { label: 'Jam Operasional', id: 'tentang' },
                { label: 'Program Membership', id: 'membership' },
                { label: 'FAQ / Bantuan', id: 'faq' },
                { label: 'Promo & Paket', id: 'layanan' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    className="guest-footer__link"
                    onClick={() => handleScrollTo(item.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak column */}
          <div className="guest-footer__col" id="kontak-info">
            <h3 className="guest-footer__col-title">Kontak</h3>
            <ul className="guest-footer__contact-list" role="list">
              <li className="guest-footer__contact-item">
                <div className="guest-footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <address className="guest-footer__contact-text not-italic">
                  Jl. Hewan Sehat No. 88<br />
                  Kec. Bahagia, Kota Sehat<br />
                  12345, Indonesia
                </address>
              </li>
              <li className="guest-footer__contact-item">
                <div className="guest-footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.54 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.07 6.07l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <a href="tel:+62812345678" className="guest-footer__contact-text guest-footer__contact-link">
                  +62 812-3456-78
                </a>
              </li>
              <li className="guest-footer__contact-item">
                <div className="guest-footer__contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <a href="mailto:hello@petcareclinic.id" className="guest-footer__contact-text guest-footer__contact-link">
                  hello@petcareclinic.id
                </a>
              </li>

              {/* Operating hours */}
              <li className="guest-footer__hours">
                <div className="guest-footer__hours-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <strong>Jam Operasional</strong>
                </div>
                <div className="guest-footer__hours-row">
                  <span>Senin – Sabtu</span>
                  <span>08:00 – 21:00</span>
                </div>
                <div className="guest-footer__hours-row">
                  <span>Minggu & Libur</span>
                  <span>09:00 – 18:00</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="guest-footer__bottom">
          <p className="guest-footer__copyright">
            © {year} <strong>PetCare Clinic</strong>. All rights reserved. Made with ❤️ for your beloved pets.
          </p>
          <div className="guest-footer__legal">
            <button className="guest-footer__legal-link">Kebijakan Privasi</button>
            <span aria-hidden="true">·</span>
            <button className="guest-footer__legal-link">Syarat & Ketentuan</button>
            <span aria-hidden="true">·</span>
            <button className="guest-footer__legal-link">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
