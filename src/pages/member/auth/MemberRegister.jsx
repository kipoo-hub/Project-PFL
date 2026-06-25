import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../../context/MemberAuthContext';
import './member-auth.css';
import { supabase } from '../../../lib/supabase';

const LogoSVG = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <circle cx="20" cy="20" r="20" fill="url(#regLogoGrad)" />
    <path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M20 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" opacity="0.9"/>
    <path d="M10 24c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6v2H10v-2z" fill="white"/>
    <circle cx="15.5" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="20" cy="21" r="1.2" fill="#16a34a" />
    <circle cx="24.5" cy="21" r="1.2" fill="#16a34a" />
    <defs>
      <linearGradient id="regLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

const PetSVG = () => (
  <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" width="180" height="180">
    <circle cx="110" cy="110" r="100" fill="rgba(255,255,255,0.06)" />
    <ellipse cx="110" cy="140" rx="52" ry="40" fill="#f5e6d3" />
    <circle cx="110" cy="85" r="42" fill="#f5e6d3" />
    <ellipse cx="78" cy="62" rx="18" ry="25" fill="#d4a373" transform="rotate(-15 78 62)" />
    <ellipse cx="142" cy="62" rx="18" ry="25" fill="#d4a373" transform="rotate(15 142 62)" />
    <ellipse cx="100" cy="95" rx="7" ry="8" fill="#2d1b0e" />
    <ellipse cx="120" cy="95" rx="7" ry="8" fill="#2d1b0e" />
    <circle cx="102" cy="93" r="2" fill="white" />
    <circle cx="122" cy="93" r="2" fill="white" />
    <ellipse cx="110" cy="104" rx="7" ry="5" fill="#2d1b0e" />
    <path d="M100 110 Q110 118 120 110" stroke="#2d1b0e" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="88" cy="107" r="8" fill="#f4a261" opacity="0.35" />
    <circle cx="132" cy="107" r="8" fill="#f4a261" opacity="0.35" />
    <ellipse cx="75" cy="165" rx="18" ry="13" fill="#f5e6d3" />
    <ellipse cx="145" cy="165" rx="18" ry="13" fill="#f5e6d3" />
    <circle cx="69" cy="168" r="4" fill="#d4a373" />
    <circle cx="78" cy="172" r="4" fill="#d4a373" />
    <circle cx="87" cy="168" r="4" fill="#d4a373" />
    <circle cx="139" cy="168" r="4" fill="#d4a373" />
    <circle cx="148" cy="172" r="4" fill="#d4a373" />
    <circle cx="157" cy="168" r="4" fill="#d4a373" />
    <path d="M158 145 Q178 120 170 96 Q182 82 190 100" stroke="#d4a373" strokeWidth="12" strokeLinecap="round" fill="none" style={{transformOrigin:'158px 145px', animation:'wag 1.2s ease-in-out infinite alternate'}} />
    <style>{`@keyframes wag { from{transform:rotate(-12deg)} to{transform:rotate(12deg)} }`}</style>
  </svg>
);

export default function MemberRegister() {
  const navigate = useNavigate();
  const { register } = useMemberAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!form.email.trim()) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.phone.trim()) errs.phone = 'Nomor WhatsApp wajib diisi';
    if (!form.password) errs.password = 'Password wajib diisi';
    else if (form.password.length < 8) errs.password = 'Password minimal 8 karakter';
    if (form.password !== form.confirm) errs.confirm = 'Konfirmasi password tidak cocok';
    if (!form.terms) errs.terms = 'Kamu harus menyetujui syarat & ketentuan';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // 1. Check if email exists
      const { data: existing, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('email', form.email);
        
      if (existing && existing.length > 0) {
        setErrors({ email: 'Email sudah terdaftar' });
        setLoading(false);
        return;
      }

      // 2. Insert into members table
      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert([{
          name: form.name,
          email: form.email,
          password: form.password,
        }])
        .select()
        .single();

      if (insertError || !newMember) {
        setErrors({ auth: 'Gagal membuat akun member' });
        setLoading(false);
        return;
      }

      // 3. Auto-insert to pipeline_members table for CRM pipeline
      await supabase
        .from('pipeline_members')
        .insert([{
          member_id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          phone: form.phone,
          stage: 'BARU',
          visits: 0,
          total_transaksi: 0,
          pets: [],
        }]);

      // 4. Log in the user in our AuthContext
      register({
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: 'member',
        created_at: newMember.created_at
      });

      setSuccess(`Selamat datang, ${form.name.split(' ')[0]}! Akun member kamu berhasil dibuat.`);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      console.error(err);
      setErrors({ auth: 'Terjadi kesalahan sistem' });
    } finally {
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

  const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const FieldIcon = ({ type }) => {
    const icons = {
      user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
      email: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
      phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.54 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.07 6.07l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
      lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    };
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </svg>
    );
  };

  return (
    <div className="mauth-page">
      {/* ── LEFT PANEL ── */}
      <div className="mauth-left">
        <div className="mauth-left__blob mauth-left__blob--1" />
        <div className="mauth-left__blob mauth-left__blob--2" />

        <div className="mauth-left__logo">
          <LogoSVG />
          <span className="mauth-left__logo-text">Veterinario</span>
        </div>

        <div className="mauth-left__content">
          <h1 className="mauth-left__title">
            Daftar Gratis,<br />
            <span>Kelola Kesehatan</span><br />
            Hewan Peliharaanmu
          </h1>
          <p className="mauth-left__subtitle">
            Bergabung dengan ribuan pemilik hewan yang mempercayakan kesehatan peliharaannya kepada Veterinario.
          </p>
          <div className="mauth-left__illustration">
            <div className="mauth-left__pet-card">
              <PetSVG />
            </div>
          </div>
        </div>

        <div className="mauth-left__benefits">
          {[
            'Booking janji temu online kapan saja',
            'Akses rekam medis digital',
            'Reminder vaksinasi otomatis',
            'Chat langsung dengan dokter',
          ].map((b) => (
            <div key={b} className="mauth-left__benefit">
              <div className="mauth-left__benefit-check"><CheckIcon /></div>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="mauth-left__footer">© 2024 Veterinario. All rights reserved.</div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="mauth-right">
        <div className="mauth-form-wrap">
          <div className="mauth-form-header">
            <div className="mauth-form-eyebrow">
              <div className="mauth-form-eyebrow__dot" />
              Daftar Member Gratis
            </div>
            <h2 className="mauth-form-title">Buat Akun Member</h2>
            <p className="mauth-form-subtitle">Isi data di bawah untuk mulai menikmati layanan Veterinario.</p>
          </div>

          {success && (
            <div className="mauth-success" role="alert">
              <span className="mauth-success__icon">🎉</span>
              <p className="mauth-success__text">{success} Mengarahkan ke dashboard...</p>
            </div>
          )}

          <form id="member-register-form" onSubmit={handleSubmit} noValidate>
            {errors.auth && (
              <div className="mauth-field__error" style={{ marginBottom: 16 }}>
                ⚠ {errors.auth}
              </div>
            )}
            {/* Nama */}
            <div className="mauth-field">
              <label htmlFor="reg-name">Nama Lengkap</label>
              <div className="mauth-field__wrap">
                <span className="mauth-field__icon"><FieldIcon type="user" /></span>
                <input
                  id="reg-name"
                  className={`mauth-input ${errors.name ? 'error' : ''}`}
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <div className="mauth-field__error">⚠ {errors.name}</div>}
            </div>

            {/* Email */}
            <div className="mauth-field">
              <label htmlFor="reg-email">Email</label>
              <div className="mauth-field__wrap">
                <span className="mauth-field__icon"><FieldIcon type="email" /></span>
                <input
                  id="reg-email"
                  className={`mauth-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="mauth-field__error">⚠ {errors.email}</div>}
            </div>

            {/* Telepon */}
            <div className="mauth-field">
              <label htmlFor="reg-phone">Nomor WhatsApp</label>
              <div className="mauth-field__wrap">
                <span className="mauth-field__icon"><FieldIcon type="phone" /></span>
                <input
                  id="reg-phone"
                  className={`mauth-input ${errors.phone ? 'error' : ''}`}
                  type="tel"
                  placeholder="08xx-xxxx-xxxx"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <div className="mauth-field__error">⚠ {errors.phone}</div>}
            </div>

            {/* Password row */}
            <div className="mauth-field-row">
              <div className="mauth-field">
                <label htmlFor="reg-password">Password</label>
                <div className="mauth-field__wrap">
                  <span className="mauth-field__icon"><FieldIcon type="lock" /></span>
                  <input
                    id="reg-password"
                    className={`mauth-input mauth-input--icon-right ${errors.password ? 'error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 karakter"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="mauth-field__eye" onClick={() => setShowPass((s) => !s)} aria-label="Toggle password">
                    <EyeIcon show={showPass} />
                  </button>
                </div>
                {errors.password && <div className="mauth-field__error">⚠ {errors.password}</div>}
              </div>

              <div className="mauth-field">
                <label htmlFor="reg-confirm">Konfirmasi Password</label>
                <div className="mauth-field__wrap">
                  <span className="mauth-field__icon"><FieldIcon type="lock" /></span>
                  <input
                    id="reg-confirm"
                    className={`mauth-input mauth-input--icon-right ${errors.confirm ? 'error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="mauth-field__eye" onClick={() => setShowConfirm((s) => !s)} aria-label="Toggle confirm">
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {errors.confirm && <div className="mauth-field__error">⚠ {errors.confirm}</div>}
              </div>
            </div>

            {/* Terms */}
            <div className="mauth-checkbox">
              <input id="reg-terms" type="checkbox" checked={form.terms} onChange={set('terms')} />
              <label htmlFor="reg-terms">
                Saya setuju dengan{' '}
                <a href="#" className="mauth-checkbox__link">Syarat & Ketentuan</a>
                {' '}dan{' '}
                <a href="#" className="mauth-checkbox__link">Kebijakan Privasi</a>{' '}
                Veterinario
              </label>
            </div>
            {errors.terms && <div className="mauth-field__error" style={{ marginTop: -18, marginBottom: 14 }}>⚠ {errors.terms}</div>}

            <button id="member-register-submit" type="submit" className="mauth-submit" disabled={loading}>
              {loading ? (
                <div className="mauth-dots">
                  <span className="mauth-dot" /><span className="mauth-dot" /><span className="mauth-dot" />
                  <span style={{ marginLeft: 6, fontSize: '0.9rem' }}>Mendaftarkan...</span>
                </div>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <p className="mauth-footer-link">
            Sudah punya akun?{' '}
            <Link to="/member/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
