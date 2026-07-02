import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth, redirectByRole } from '../../context/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import '../../pages/member/auth/member-auth.css';

const LogoSVG = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <circle cx="20" cy="20" r="20" fill="url(#loginNewGrad)" />
    <path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M20 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M10 24c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v2H10v-2z" fill="white"/>
    <circle cx="15.5" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="20" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="24.5" cy="21" r="1.2" fill="#16a34a" />
    <defs>
      <linearGradient id="loginNewGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

const CatIllustration = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
    <circle cx="110" cy="110" r="100" fill="rgba(255,255,255,0.06)" />
    <ellipse cx="110" cy="145" rx="50" ry="38" fill="#e8d5c4" />
    <circle cx="110" cy="90" r="40" fill="#e8d5c4" />
    <path d="M78 65 L68 42 L90 55 Z" fill="#e8d5c4" />
    <path d="M142 65 L152 42 L130 55 Z" fill="#e8d5c4" />
    <path d="M80 63 L72 46 L88 57 Z" fill="#f4a5b4" opacity="0.6" />
    <path d="M140 63 L148 46 L132 57 Z" fill="#f4a5b4" opacity="0.6" />
    <ellipse cx="98" cy="88" rx="7" ry="8" fill="#2d1b0e" />
    <ellipse cx="122" cy="88" rx="7" ry="8" fill="#2d1b0e" />
    <circle cx="100" cy="86" r="2" fill="white" />
    <circle cx="124" cy="86" r="2" fill="white" />
    <path d="M107 98 L110 101 L113 98 Z" fill="#f4a5b4" />
    <line x1="70" y1="97" x2="100" y2="101" stroke="#2d1b0e" strokeWidth="1" opacity="0.4" />
    <line x1="70" y1="103" x2="100" y2="103" stroke="#2d1b0e" strokeWidth="1" opacity="0.4" />
    <line x1="120" y1="101" x2="150" y2="97" stroke="#2d1b0e" strokeWidth="1" opacity="0.4" />
    <line x1="120" y1="103" x2="150" y2="103" stroke="#2d1b0e" strokeWidth="1" opacity="0.4" />
    <path d="M103 107 Q110 113 117 107" stroke="#2d1b0e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="86" cy="104" r="9" fill="#f4a261" opacity="0.3" />
    <circle cx="134" cy="104" r="9" fill="#f4a261" opacity="0.3" />
    <ellipse cx="76" cy="168" rx="17" ry="12" fill="#e8d5c4" />
    <ellipse cx="144" cy="168" rx="17" ry="12" fill="#e8d5c4" />
    <path d="M155 148 Q175 120 165 95 Q180 78 178 105" stroke="#e8d5c4" strokeWidth="12" strokeLinecap="round" fill="none" />
    <path d="M80 118 Q110 128 140 118" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    <circle cx="110" cy="123" r="5" fill="#16a34a" opacity="0.9" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useMemberAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
    if (!password) errs.password = 'Password wajib diisi';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await signIn(email, password);
      const user = data?.user;

      if (!user) {
        throw new Error('Gagal mendapatkan informasi user.');
      }

      // Fetch user profile from database to get role ('admin' | 'member' | 'guest')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const role = (profile && !profileError) ? profile.role : 'guest';

      setLoginSuccess(true);
      setLoading(false);

      // Redirect immediately based on role
      redirectByRole(role, navigate);

      // Fallback: jika navigation gagal
      timeoutRef.current = setTimeout(() => {
        redirectByRole(role, navigate);
      }, 3000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrors({ auth: 'Email atau password salah' });
      } else {
        setErrors({ auth: err.message || 'Terjadi kesalahan sistem' });
      }
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      ) : (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      )}
    </svg>
  );

  // Loading screen setelah login sukses — menunggu GuestRoute redirect
  if (loginSuccess) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0fdf4'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #e2e8f0',
            borderTopColor: '#16a34a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#166534', fontWeight: 600, fontSize: '1rem' }}>
            Login berhasil, mengarahkan...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="mauth-page">
      {/* LEFT PANEL */}
      <div className="mauth-left">
        <div className="mauth-left__blob mauth-left__blob--1" />
        <div className="mauth-left__blob mauth-left__blob--2" />

        <div className="mauth-left__logo">
          <LogoSVG />
          <span className="mauth-left__logo-text">Veterinario</span>
        </div>

        <div className="mauth-left__content">
          <h1 className="mauth-left__title">
            Selamat Datang<br />
            <span>Kembali!</span>
          </h1>
          <p className="mauth-left__subtitle">
            Masuk ke akun Anda untuk mengakses layanan lengkap Veterinario.
          </p>
          <div className="mauth-left__illustration">
            <div className="mauth-left__pet-card">
              <CatIllustration />
            </div>
          </div>
        </div>

        <div className="mauth-left__benefits">
          {[
            'Akses dashboard & laporan klinik',
            'Kelola janji temu & rekam medis',
            'Notifikasi vaksinasi otomatis',
            'Fitur CRM lengkap',
          ].map((b) => (
            <div key={b} className="mauth-left__benefit">
              <div className="mauth-left__benefit-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="mauth-left__footer">© 2025 Veterinario. All rights reserved.</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="mauth-right">
        <div className="mauth-form-wrap">
          <div className="mauth-form-header">
            <div className="mauth-form-eyebrow">
              <div className="mauth-form-eyebrow__dot" />
              Masuk
            </div>
            <h2 className="mauth-form-title">Masuk ke Akun</h2>
            <p className="mauth-form-subtitle">
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
                Daftar Gratis
              </Link>
            </p>
          </div>

          <form id="login-page-form" onSubmit={handleSubmit} noValidate>
            {errors.auth && (
              <div className="mauth-field__error" style={{ marginBottom: 16, backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
                <span style={{ marginRight: 6 }}>⚠</span> {errors.auth}
              </div>
            )}

            {/* Email */}
            <div className="mauth-field">
              <label htmlFor="login-email">Email</label>
              <div className="mauth-field__wrap">
                <span className="mauth-field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="login-email"
                  className={`mauth-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="mauth-field__error">⚠ {errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mauth-field">
              <label htmlFor="login-password">Password</label>
              <div className="mauth-field__wrap">
                <span className="mauth-field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="login-password"
                  className={`mauth-input mauth-input--icon-right ${errors.password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="mauth-field__eye" onClick={() => setShowPass((s) => !s)} aria-label="Toggle password">
                  <EyeIcon show={showPass} />
                </button>
              </div>
              {errors.password && <div className="mauth-field__error">⚠ {errors.password}</div>}
            </div>

            <div className="mauth-forgot">
              <Link to="/forgot-password" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                Lupa password?
              </Link>
            </div>

            <button id="login-submit-btn" type="submit" className="mauth-submit" disabled={loading}>
              {loading ? (
                <div className="mauth-dots">
                  <span className="mauth-dot" /><span className="mauth-dot" /><span className="mauth-dot" />
                  <span style={{ marginLeft: 6, fontSize: '0.9rem' }}>Masuk...</span>
                </div>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mauth-divider">atau</div>

          <p className="mauth-footer-link">
            Belum punya akun?{' '}
            <Link to="/register">Daftar Gratis Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
