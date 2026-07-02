import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../pages/member/auth/member-auth.css';

const LogoSVG = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <circle cx="20" cy="20" r="20" fill="url(#fpGrad)" />
    <path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M20 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M10 24c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v2H10v-2z" fill="white"/>
    <defs>
      <linearGradient id="fpGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Gagal mengirim email reset password. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
            Lupa<br />
            <span>Password?</span>
          </h1>
          <p className="mauth-left__subtitle">
            Tenang, kami akan bantu Anda mereset password akun Veterinario Anda.
          </p>
          <div className="mauth-left__illustration" style={{ opacity: 0.5 }}>
            <svg viewBox="0 0 200 200" fill="none" width="160" height="160">
              <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.06)" />
              <rect x="60" y="90" width="80" height="60" rx="8" fill="#e8d5c4" opacity="0.6" />
              <path d="M70 90V70a30 30 0 0 1 60 0v20" stroke="#e8d5c4" strokeWidth="6" fill="none" opacity="0.6" />
              <circle cx="100" cy="118" r="8" fill="#16a34a" opacity="0.7" />
              <path d="M100 112v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="35" y1="55" x2="65" y2="75" stroke="#16a34a" strokeWidth="2" opacity="0.3" />
              <line x1="165" y1="55" x2="135" y2="75" stroke="#16a34a" strokeWidth="2" opacity="0.3" />
            </svg>
          </div>
        </div>

        <div className="mauth-left__benefits">
          {[
            'Proses reset cepat & aman',
            'Link reset dikirim ke email',
            'Kembali akses akun dalam hitungan menit',
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
          {sent ? (
            <>
              <div className="mauth-form-header">
                <div className="mauth-form-eyebrow">
                  <div className="mauth-form-eyebrow__dot" />
                  Email Terkirim
                </div>
                <h2 className="mauth-form-title">Cek Email Anda</h2>
              </div>

              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 12,
                padding: '24px 20px',
                textAlign: 'center',
                marginBottom: 20
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📧</div>
                <p style={{ color: '#166534', fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>
                  Kami telah mengirim link reset password ke:
                </p>
                <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.05rem' }}>{email}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.6 }}>
                  Silakan cek inbox (atau folder spam) email Anda dan klik link yang kami kirimkan untuk mereset password.
                </p>
              </div>

              <Link to="/login" className="mauth-submit" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                textDecoration: 'none', marginTop: 8
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Kembali ke Login
              </Link>
            </>
          ) : (
            <>
              <div className="mauth-form-header">
                <div className="mauth-form-eyebrow">
                  <div className="mauth-form-eyebrow__dot" />
                  Reset Password
                </div>
                <h2 className="mauth-form-title">Lupa Password</h2>
                <p className="mauth-form-subtitle">
                  Masukkan email yang terdaftar. Kami akan kirimkan link untuk mereset password Anda.
                </p>
              </div>

              <form id="forgot-password-form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="mauth-field__error" style={{ marginBottom: 16, backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
                    ⚠ {error}
                  </div>
                )}

                <div className="mauth-field">
                  <label htmlFor="fp-email">Email</label>
                  <div className="mauth-field__wrap">
                    <span className="mauth-field__icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      id="fp-email"
                      className="mauth-input"
                      type="email"
                      placeholder="email@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button id="fp-submit-btn" type="submit" className="mauth-submit" disabled={loading}>
                  {loading ? (
                    <div className="mauth-dots">
                      <span className="mauth-dot" /><span className="mauth-dot" /><span className="mauth-dot" />
                      <span style={{ marginLeft: 6, fontSize: '0.9rem' }}>Mengirim...</span>
                    </div>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 2L11 13"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                      </svg>
                      Kirim Link Reset
                    </>
                  )}
                </button>
              </form>

              <p className="mauth-footer-link" style={{ marginTop: 20 }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Kembali ke halaman login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
