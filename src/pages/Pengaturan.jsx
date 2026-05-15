import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { User, Building2, Clock, Bell, Shield, Save, Check } from 'lucide-react';

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

const Pengaturan = () => {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ nama: 'Dr Muhammad Taufiq', email: 'muhammad.taufiq@petcareclinic.com', telepon: '0812-1111-2222', spesialis: 'Bedah & Umum' });
  const [klinik, setKlinik] = useState({ namaKlinik: 'PetCare Clinic', alamat: 'Jl. Veteriner No. 12, Jakarta Selatan', jamBuka: '08:00', jamTutup: '20:00' });
  const [notif, setNotif] = useState({ jadwalBaru: true, pasienKritis: true, laporanHarian: false, promoEmail: false });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)' }}>
      <PageHeader title="Pengaturan" subtitle="Kelola profil, informasi klinik, dan preferensi sistem." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left column */}
        <div>
          {/* Profile */}
          <Section icon={User} title="Profil Dokter">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 16px', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>DR</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{profile.nama}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Dokter Hewan · {profile.spesialis}</div>
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
                <input style={inputStyle} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              </Field>
              <Field label="No. Telepon">
                <input style={inputStyle} value={profile.telepon} onChange={e => setProfile(p => ({ ...p, telepon: e.target.value }))} />
              </Field>
            </div>
          </Section>

          {/* Security */}
          <Section icon={Shield} title="Keamanan">
            <Field label="Password Saat Ini"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
            <Field label="Password Baru"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
            <Field label="Konfirmasi Password Baru"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
            <button id="pengaturan-change-password-btn" style={{ padding:'9px 18px', borderRadius:8, border:'1px solid var(--border-color)', background:'white', fontSize:13, fontWeight:600, color:'var(--text-primary)', cursor:'pointer', marginTop:4 }}>
              Ganti Password
            </button>
          </Section>
        </div>

        {/* Right column */}
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
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          id="pengaturan-save-btn"
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: saved ? 'var(--accent-teal)' : 'linear-gradient(135deg,var(--accent-blue),#4c6ef5)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: saved ? '0 4px 12px rgba(12,166,120,0.35)' : '0 4px 12px rgba(59,91,219,0.3)',
            transition: 'all 0.3s',
          }}
        >
          {saved ? <><Check size={16} /> Tersimpan!</> : <><Save size={16} /> Simpan Perubahan</>}
        </button>
      </div>
    </div>
  );
};

export default Pengaturan;
