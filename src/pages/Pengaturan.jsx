import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';
import { User, Building2, Clock, Bell, Shield, Save, Check, Loader2, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid var(--border-color)', background: '#fafafa' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="var(--accent-blue)" />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
    </div>
    <div style={{ padding: '20px 22px' }}>{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)',
  borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-app)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const Toggle = ({ checked, onChange, id }) => (
  <button id={id} onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: checked ? 'var(--accent-blue)' : '#d1d5db', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
    <div style={{
      position: 'absolute', top: 2, left: checked ? 22 : 2,
      width: 20, height: 20, borderRadius: '50%', background: 'white',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
    }} />
  </button>
);

// ── Toast Notification ──────────────────────────────────────────
const Toast = ({ message, type, visible }) => {
  if (!visible) return null;
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 20px', borderRadius: 12, background: bgColor,
      color: 'white', fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', animation: 'slideUp 0.3s ease',
    }}>
      {type === 'success' ? <Check size={18} /> : type === 'error' ? <AlertCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
      {message}
    </div>
  );
};

const Pengaturan = () => {
  // ── User / Session state ────────────────────────────────────
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Profile fields ──────────────────────────────────────────
  const [profile, setProfile] = useState({ nama: '', email: '', telepon: '', spesialis: '' });

  // ── Security / Password ─────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // ── Clinic & Notifications (local) ──────────────────────────
  const [klinik, setKlinik] = useState({ namaKlinik: 'PetCare Clinic', alamat: 'Jl. Veteriner No. 12, Jakarta Selatan', jamBuka: '08:00', jamTutup: '20:00' });
  const [notif, setNotif] = useState({ jadwalBaru: true, pasienKritis: true, laporanHarian: false, promoEmail: false });

  // ── Toast ───────────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };

  // ── Load session & user profile ─────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session: ses }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!ses) { setLoading(false); return; }

        setSession(ses);
        const uid = ses.user.id;

        // Fetch profile from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', uid)
          .single();

        if (profileData) {
          setProfile({
            nama: profileData.name || '',
            email: profileData.email || ses.user.email || '',
            telepon: profileData.phone || '',
            spesialis: profileData.spesialis || profileData.specialist || 'Dokter Hewan',
          });
        } else {
          // Fallback to auth metadata
          setProfile({
            nama: ses.user.user_metadata?.name || 'Admin',
            email: ses.user.email || '',
            telepon: '',
            spesialis: 'Dokter Hewan',
          });
        }

        // Try to load clinic info if stored
        const { data: klinikData } = await supabase
          .from('klinik_settings')
          .select('*')
          .single();
        if (klinikData) {
          setKlinik({
            namaKlinik: klinikData.nama || 'PetCare Clinic',
            alamat: klinikData.alamat || 'Jl. Veteriner No. 12, Jakarta Selatan',
            jamBuka: klinikData.jamBuka || '08:00',
            jamTutup: klinikData.jamTutup || '20:00',
          });
        }
      } catch (err) {
        console.error('Gagal memuat data pengguna:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ── Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: profile.nama, phone: profile.telepon })
        .eq('user_id', session.user.id);

      if (error) throw error;
      showToast('Profil berhasil disimpan!', 'success');
    } catch (err) {
      showToast('Gagal menyimpan profil: ' + err.message, 'error');
    }
  };

  // ── Change password ─────────────────────────────────────────
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Harap isi semua field password!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Password baru dan konfirmasi tidak cocok!', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      // Re-authenticate user with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        showToast('Password saat ini salah!', 'error');
        setChangingPassword(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showToast('Password berhasil diubah!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Gagal mengubah password: ' + err.message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Memuat pengaturan...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', position: 'relative' }}>
      <PageHeader title="Pengaturan" subtitle="Kelola profil, informasi klinik, dan keamanan akun." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* ───── Left column ───── */}
        <div>
          {/* Profile Section */}
          <Section icon={User} title="Profil Admin">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 16px', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {profile.nama ? profile.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{profile.nama || 'Admin'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{profile.spesialis || 'Dokter Hewan'} · {profile.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nama Lengkap">
                <input style={inputStyle} value={profile.nama} onChange={e => setProfile(p => ({ ...p, nama: e.target.value }))} />
              </Field>
              <Field label="Spesialis">
                <input style={inputStyle} value={profile.spesialis} onChange={e => setProfile(p => ({ ...p, spesialis: e.target.value }))} />
              </Field>
              <Field label="Email">
                <input style={{ ...inputStyle, background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} type="email" value={profile.email} disabled />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>Email tidak dapat diubah</span>
              </Field>
              <Field label="No. Telepon">
                <input style={inputStyle} value={profile.telepon} onChange={e => setProfile(p => ({ ...p, telepon: e.target.value }))} />
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={handleSaveProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,var(--accent-blue),#4c6ef5)',
                  color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59,91,219,0.25)', transition: 'all 0.2s',
                }}
              >
                <Save size={15} /> Simpan Profil
              </button>
            </div>
          </Section>

          {/* Security / Password Section */}
          <Section icon={KeyRound} title="Keamanan & Kata Sandi">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun admin.
            </p>
            <Field label="Password Saat Ini">
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Password Baru">
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Konfirmasi Password Baru">
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: -8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={13} /> Password baru tidak cocok
              </div>
            )}
            {newPassword && newPassword.length < 6 && (
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: -8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={13} /> Password minimal 6 karakter
              </div>
            )}
            <button
              id="pengaturan-change-password-btn"
              onClick={handleChangePassword}
              disabled={changingPassword}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: changingPassword ? '#f1f5f9' : 'white',
                fontSize: 13, fontWeight: 600,
                color: changingPassword ? '#94a3b8' : 'var(--text-primary)',
                cursor: changingPassword ? 'not-allowed' : 'pointer',
                opacity: changingPassword ? 0.7 : 1,
                marginTop: 4, transition: 'all 0.2s',
              }}
            >
              {changingPassword ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Mengganti...</> : <><Shield size={15} /> Ganti Password</>}
            </button>
          </Section>
        </div>

        {/* ───── Right column ───── */}
        <div>
          {/* Clinic Info */}
          <Section icon={Building2} title="Informasi Klinik">
            <Field label="Nama Klinik">
              <input style={inputStyle} value={klinik.namaKlinik} onChange={e => setKlinik(k => ({ ...k, namaKlinik: e.target.value }))} />
            </Field>
            <Field label="Alamat Klinik">
              <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={klinik.alamat} onChange={e => setKlinik(k => ({ ...k, alamat: e.target.value }))} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Jam Buka"><input style={inputStyle} type="time" value={klinik.jamBuka} onChange={e => setKlinik(k => ({ ...k, jamBuka: e.target.value }))} /></Field>
              <Field label="Jam Tutup"><input style={inputStyle} type="time" value={klinik.jamTutup} onChange={e => setKlinik(k => ({ ...k, jamTutup: e.target.value }))} /></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => showToast('Informasi klinik disimpan (lokal)', 'success')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)',
                  background: 'white', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-primary)', cursor: 'pointer',
                }}
              >
                <Save size={15} /> Simpan Klinik
              </button>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={Bell} title="Notifikasi">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'jadwalBaru',    label: 'Janji Temu Baru',     desc: 'Notifikasi saat ada jadwal baru masuk' },
                { key: 'pasienKritis',  label: 'Pasien Kritis',        desc: 'Notifikasi darurat untuk pasien kritis' },
                { key: 'laporanHarian', label: 'Laporan Harian',       desc: 'Ringkasan kunjungan dikirim setiap hari' },
                { key: 'promoEmail',    label: 'Email Promosi',         desc: 'Informasi promo dan update fitur' },
              ].map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <Toggle id={`toggle-${n.key}`} checked={notif[n.key]} onChange={v => setNotif(p => ({ ...p, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </Section>

          {/* Session Info */}
          <Section icon={Clock} title="Sesi & Aktivitas">
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Status Akun</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Aktif
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Role</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-blue)', background: 'var(--accent-blue-light)', padding: '2px 10px', borderRadius: 6 }}>Admin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Terdaftar Sejak</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </span>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Inject spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Pengaturan;
