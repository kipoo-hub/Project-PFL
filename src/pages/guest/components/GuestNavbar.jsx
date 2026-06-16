import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function GuestNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeSection, setActiveSection] = useState('beranda');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const prevScrollPosRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const prevScrollPos = prevScrollPosRef.current;

      // Scrolled > 50px
      setScrolled(currentScrollPos > 50);

      // Scroll direction: visible if scrolling up or at top
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      setVisible(isVisible);
      prevScrollPosRef.current = currentScrollPos;

      // Active section detection
      const sections = ['beranda', 'layanan', 'tentang', 'kontak'];
      
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);
      if (isAtBottom) {
        setActiveSection('kontak');
        return;
      }

      const scrollPosition = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`guest-navbar ${scrolled ? 'guest-navbar--scrolled' : ''} ${!visible ? 'guest-navbar--hidden' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="guest-container guest-navbar__inner">
        {/* Logo */}
        <button
          className="guest-navbar__logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Veterinario - Kembali ke atas"
        >
          <div className="guest-navbar__logo-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
              <path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
              <path d="M20 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
              <path d="M10 24c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v2H10v-2z" fill="white"/>
              <circle cx="15.5" cy="21" r="1.2" fill="#16a34a" />
              <circle cx="20" cy="21" r="1.2" fill="#16a34a" />
              <circle cx="24.5" cy="21" r="1.2" fill="#16a34a" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="guest-navbar__logo-text">Veterinario</span>
        </button>

        {/* Desktop Nav Links */}
        <ul className="guest-navbar__links" role="list">
          {[
            { label: 'Beranda', id: 'beranda' },
            { label: 'Layanan', id: 'layanan' },
            { label: 'Tentang Kami', id: 'tentang' },
            { label: 'Kontak', id: 'kontak' },
          ].map((item) => (
            <li key={item.id}>
              <button
                className={`guest-navbar__link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleScrollTo(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="guest-navbar__actions">
          <button
            id="navbar-daftar-btn"
            className="guest-btn guest-btn--outline-green"
            onClick={() => navigate('/member/register')}
          >
            Daftar Gratis
          </button>
          <button
            id="navbar-cta-btn"
            className="guest-btn guest-btn--primary"
            onClick={() => handleScrollTo('kontak')}
          >
            Buat Janji
          </button>
          {/* Hamburger */}
          <button
            className="guest-navbar__hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className={`guest-navbar__hamburger-bar ${mobileOpen ? 'open-1' : ''}`} />
            <span className={`guest-navbar__hamburger-bar ${mobileOpen ? 'open-2' : ''}`} />
            <span className={`guest-navbar__hamburger-bar ${mobileOpen ? 'open-3' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`guest-navbar__mobile ${mobileOpen ? 'guest-navbar__mobile--open' : ''}`} aria-hidden={!mobileOpen}>
        {[
          { label: 'Beranda', id: 'beranda' },
          { label: 'Layanan', id: 'layanan' },
          { label: 'Tentang Kami', id: 'tentang' },
          { label: 'Kontak', id: 'kontak' },
        ].map((item) => (
          <button
            key={item.id}
            className={`guest-navbar__mobile-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleScrollTo(item.id)}
            style={activeSection === item.id ? { color: 'var(--vet-green)', fontWeight: '600' } : {}}
          >
            {item.label}
          </button>
        ))}
        <button
          className="guest-btn guest-btn--outline-green guest-navbar__mobile-cta"
          onClick={() => { setMobileOpen(false); navigate('/member/register'); }}
        >
          Daftar Gratis
        </button>
        <button
          className="guest-btn guest-btn--primary guest-navbar__mobile-cta"
          onClick={() => handleScrollTo('kontak')}
        >
          Buat Janji
        </button>
      </div>
    </nav>
  );
}
