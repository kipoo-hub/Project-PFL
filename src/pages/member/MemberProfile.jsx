import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { memberProfileService, pipelineService } from '../../lib/supabaseService';
import { supabase } from '../../lib/supabase';
import { logActivity } from '../../lib/logActivity';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);

const STAGE_CONFIG = {
  SETIA:     { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: '⭐ Member Setia' },
  AKTIF:     { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: '✅ Member Aktif' },
  BARU:      { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: '🆕 Member Baru' },
  TIDAK_AKTIF: { color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', label: '💤 Tidak Aktif' },
};

// ─── Reusable sub-components ──────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'white', borderRadius: 18, border: '1px solid #edf2f7',
    boxShadow: '0 1px 6px rgba(15,23,42,0.05)', padding: 24, ...style,
  }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 16,
    paddingBottom: 12, borderBottom: '1px solid #f1f5f9',
  }}>
    {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6,
  }}>
    {children}
  </label>
);

const inputStyle = (disabled = false) => ({
  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
  background: disabled ? '#f8fafc' : 'white',
  border: '1.5px solid #e2e8f0', borderRadius: 12,
  fontSize: '0.85rem', color: disabled ? '#94a3b8' : '#1e293b',
  outline: 'none', cursor: disabled ? 'not-allowed' : 'text',
  transition: 'border-color 0.2s',
});

const Toggle = ({ id, checked, onChange }) => (
  <label htmlFor={id} style={{ position: 'relative', display: 'inline-block', width: 42, height: 24, cursor: 'pointer', flexShrink: 0 }}>
    <input
      id={id} type="checkbox" checked={checked} onChange={onChange}
      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
    />
    <span style={{
      position: 'absolute', inset: 0, borderRadius: 12,
      background: checked ? '#16a34a' : '#cbd5e1',
      transition: 'background 0.25s',
    }} />
    <span style={{
      position: 'absolute', top: 3, left: checked ? 21 : 3,
      width: 18, height: 18, borderRadius: '50%', background: 'white',
      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      transition: 'left 0.25s',
    }} />
  </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberProfile() {
  const { member, logout } = useMemberAuth();
  const navigate = useNavigate();

  const [profile, setProfile]             = useState(null);
  const [name, setName]                   = useState('');
  const [phone, setPhone]                 = useState('');
  const [email, setEmail]                 = useState('');
  const [alamat, setAlamat]               = useState('');
  const [tanggalLahir, setTanggalLahir]   = useState('');
  const [notifVaksin, setNotifVaksin]     = useState(true);
  const [notifJanji, setNotifJanji]       = useState(true);
  const [notifPromo, setNotifPromo]       = useState(false);
  const [isPasswordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPw]  = useState('');
  const [newPassword, setNewPw]           = useState('');
  const [confirmPassword, setConfirmPw]   = useState('');
  const [saving, setSaving]               = useState(false);
  const [focus, setFocus]                 = useState(null);

  const loadProfile = async () => {
    try {
      const memberUser = JSON.parse(localStorage.getItem('memberUser'));
      if (!memberUser?.id) return;
      const data = await memberProfileService.getById(memberUser.id);
      if (data) {
        const pipeline = await pipelineService.getAll();
        const all = [...(pipeline.BARU || []), ...(pipeline.AKTIF || []), ...(pipeline.SETIA || []), ...(pipeline.TIDAK_AKTIF || [])];
        const pm = all.find(m => m.email?.toLowerCase() === data.email?.toLowerCase());
        setProfile({ ...data, stage: pm?.stage || 'BARU', visits: pm?.visits || 0, totalTransaksi: pm?.totalTransaksi || 0 });
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAlamat(data.alamat || '');
        setTanggalLahir(data.tanggalLahir || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => { loadProfile(); }, [member]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const memberUser = JSON.parse(localStorage.getItem('memberUser'));
      if (!memberUser?.id) return;
      await memberProfileService.update(memberUser.id, { name, email });
      localStorage.setItem('memberUser', JSON.stringify({ ...memberUser, name }));
      await logActivity('Memperbarui profil member', { name, email });
      await loadProfile();
      alert('Profil berhasil diperbarui!');
    } catch {
      alert('Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert('Konfirmasi sandi tidak cocok!'); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await logActivity('Mengubah kata sandi akun');
      alert('Kata sandi berhasil diubah!');
      setPasswordModal(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      alert('Gagal mengubah sandi: ' + err.message);
    }
  };

  const handleLogout = () => { logout(); navigate('/guest', { replace: true }); };

  if (!profile) return (
    <div className="guest-page">
      <GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Memuat profil…</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const stageCfg = STAGE_CONFIG[profile.stage] || STAGE_CONFIG.BARU;

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .pw-input:focus { border-color: #16a34a !important; box-shadow: 0 0 0 3px #bbf7d040; }
        .field-input:focus { border-color: #16a34a !important; box-shadow: 0 0 0 3px #bbf7d030; }
      `}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">

          {/* ── Page Header ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>
              Pengaturan Akun
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Profil Saya</h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Kelola data diri, preferensi notifikasi, dan keamanan kata sandi akun Anda.
            </p>
          </div>

          {/* ── Layout Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Avatar & Identity */}
              <Card style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 0 }}>
                {/* Gradient stripe */}
                <div style={{ height: 6, background: 'linear-gradient(90deg, #16a34a, #0ea5e9)' }} />
                <div style={{ padding: '24px 24px 28px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 76, height: 76, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16a34a, #0ea5e9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', fontWeight: 800, color: 'white',
                    margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  }}>
                    {initials}
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 14 }}>{email}</div>

                  {/* Stage Badge */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 9999,
                    background: stageCfg.bg, border: `1px solid ${stageCfg.border}`,
                    fontSize: '0.72rem', fontWeight: 700, color: stageCfg.color,
                  }}>
                    {stageCfg.label}
                  </span>

                  {/* Stats */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 1, marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 20,
                    background: '#f8fafc', borderRadius: 12, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '12px 8px', textAlign: 'center', background: 'white' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>Kunjungan</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{profile.visits}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>kali</div>
                    </div>
                    <div style={{ padding: '12px 8px', textAlign: 'center', background: 'white' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>Transaksi</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', wordBreak: 'break-all' }}>{formatRupiah(profile.totalTransaksi)}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <SectionLabel>🔔 Preferensi Notifikasi</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { id: 'vac',  label: 'Pengingat Vaksinasi',  desc: 'Notif WhatsApp saat vaksin hampir jatuh tempo.', checked: notifVaksin, set: setNotifVaksin },
                    { id: 'appt', label: 'Pengingat Janji Temu', desc: 'SMS & email konfirmasi janji temu medis.', checked: notifJanji, set: setNotifJanji },
                    { id: 'promo', label: 'Penawaran Promosi',    desc: 'Diskon dan promo layanan grooming/vaksin.', checked: notifPromo, set: setNotifPromo },
                  ].map(pref => (
                    <div key={pref.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{pref.label}</div>
                        <div style={{ fontSize: '0.71rem', color: '#94a3b8', lineHeight: 1.5 }}>{pref.desc}</div>
                      </div>
                      <Toggle id={`pref-${pref.id}`} checked={pref.checked} onChange={e => pref.set(e.target.checked)} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Edit Profile Form */}
              <Card>
                <SectionLabel>👤 Biodata Diri</SectionLabel>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <FieldLabel>Nama Lengkap</FieldLabel>
                      <input
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="field-input" style={inputStyle()}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div>
                      <FieldLabel>Nomor Telp / WhatsApp</FieldLabel>
                      <input
                        type="text" required value={phone} onChange={e => setPhone(e.target.value)}
                        className="field-input" style={inputStyle()}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <FieldLabel>Alamat Email</FieldLabel>
                      <input
                        type="email" disabled value={email}
                        style={{ ...inputStyle(true), background: '#f8fafc' }}
                        title="Email tidak dapat diubah"
                      />
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>Email tidak dapat diubah</div>
                    </div>
                    <div>
                      <FieldLabel>Tanggal Lahir</FieldLabel>
                      <input
                        type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)}
                        className="field-input" style={inputStyle()}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Alamat Rumah</FieldLabel>
                    <textarea
                      rows={3} required value={alamat} onChange={e => setAlamat(e.target.value)}
                      className="field-input"
                      style={{ ...inputStyle(), resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = '#16a34a'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="submit" disabled={saving}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 22px', borderRadius: 12, border: 'none',
                        background: saving ? '#d1fae5' : '#16a34a',
                        color: 'white', fontWeight: 700, fontSize: '0.85rem',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        boxShadow: '0 3px 12px rgba(22,163,74,0.25)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                      </svg>
                      {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </Card>

              {/* Security Panel */}
              <Card>
                <SectionLabel>🔐 Keamanan & Sesi</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>Kelola Keamanan Akun</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ubah kata sandi secara berkala untuk keamanan akun Anda.</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setPasswordModal(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', background: 'white',
                        color: '#475569', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Ganti Kata Sandi
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 12,
                        border: '1.5px solid #fecaca', background: '#fff1f1',
                        color: '#dc2626', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff1f1'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Keluar Sesi
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* ── Change Password Modal ── */}
      {isPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div
            onClick={() => setPasswordModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative', zIndex: 10,
            background: 'white', borderRadius: 20,
            width: '100%', maxWidth: 420, maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Ganti Kata Sandi</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Gunakan kata sandi yang kuat dan unik.</div>
              </div>
              <button
                onClick={() => setPasswordModal(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '1.1rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePw} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Kata Sandi Saat Ini', val: currentPassword, set: setCurrentPw, ph: 'Masukkan sandi lama' },
                  { label: 'Kata Sandi Baru',      val: newPassword,     set: setNewPw,     ph: 'Min. 8 karakter' },
                  { label: 'Konfirmasi Sandi Baru', val: confirmPassword, set: setConfirmPw, ph: 'Ulangi sandi baru' },
                ].map(f => (
                  <div key={f.label}>
                    <FieldLabel>{f.label}</FieldLabel>
                    <input
                      type="password" required placeholder={f.ph} value={f.val}
                      onChange={e => f.set(e.target.value)}
                      className="pw-input"
                      style={{ ...inputStyle(), width: '100%', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#16a34a'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setPasswordModal(false)}
                  style={{ padding: '10px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit"
                  style={{ padding: '10px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(22,163,74,0.25)' }}>
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GuestFooter />
    </div>
  );
}
