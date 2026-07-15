import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../../context/MemberAuthContext';
import logoImg from '../../../assets/logo.png';
import '../guest.css';

export default function GuestNavbar() {
  const { isLoggedIn, logout } = useMemberAuth();
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
      const sections = ['beranda', 'masalah', 'layanan', 'fitur', 'membership', 'tentang', 'faq', 'kontak'];
      
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
          aria-label="PetCare Clinic - Kembali ke atas"
        >
          <div className="guest-navbar__logo-icon" aria-hidden="true">
            <img src={logoImg} alt="PetCare Clinic Logo" width="40" height="40" style={{ objectFit: 'contain', display: 'block' }} />
          </div>
          <span className="guest-navbar__logo-text">PetCare Clinic</span>
        </button>

        {/* Desktop Nav Links */}
        <ul className="guest-navbar__links" role="list">
          {[
            { label: 'Beranda', id: 'beranda' },
            { label: 'Layanan', id: 'layanan' },
            { label: 'Membership', id: 'membership' },
            { label: 'FAQ', id: 'faq' },
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
          {isLoggedIn ? (
            <>
              <button
                id="navbar-membership-btn"
                className="guest-btn guest-btn--outline-green"
                onClick={() => navigate('/member/membership')}
              >
                🏆 Membership
              </button>
              <button
                id="navbar-dashboard-btn"
                className="guest-btn guest-btn--outline"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                id="navbar-logout-btn"
                className="guest-btn guest-btn--outline"
                onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
                style={{ color: '#e03131', borderColor: '#fecaca' }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <button
                id="navbar-daftar-btn"
                className="guest-btn guest-btn--outline-green"
                onClick={() => navigate('/register')}
              >
                Daftar Gratis
              </button>
              <button
                id="navbar-masuk-btn"
                className="guest-btn guest-btn--primary"
                onClick={() => navigate('/login')}
              >
                Masuk
              </button>
            </>
          )}
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
          { label: 'Membership', id: 'membership' },
          { label: 'FAQ', id: 'faq' },
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
        {isLoggedIn ? (
          <>
            <button
              className="guest-btn guest-btn--outline-green guest-navbar__mobile-cta"
              onClick={() => { setMobileOpen(false); navigate('/member/membership'); }}
            >
              🏆 Membership
            </button>
            <button
              className="guest-btn guest-btn--outline guest-navbar__mobile-cta"
              onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
            >
              Dashboard
            </button>
            <button
              className="guest-btn guest-btn--outline guest-navbar__mobile-cta"
              onClick={() => { setMobileOpen(false); logout(); navigate('/'); }}
              style={{ color: '#e03131', borderColor: '#fecaca' }}
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <button
              className="guest-btn guest-btn--outline-green guest-navbar__mobile-cta"
              onClick={() => { setMobileOpen(false); navigate('/register'); }}
            >
              Daftar Gratis
            </button>
            <button
              className="guest-btn guest-btn--primary guest-navbar__mobile-cta"
              onClick={() => { setMobileOpen(false); navigate('/login'); }}
            >
              Masuk
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
