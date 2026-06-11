import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';

export default function Profile() {
  const [user, setUser] = useState({ name: 'Guest', role: 'Guest', initials: 'G', email: 'guest@klinik.com' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({ ...parsedUser, email: parsedUser.email || 'dokter@petcareclinic.com' });
    }
  }, []);

  return (
    <div>
      <PageHeader title="Profil Pengguna" subtitle="Kelola informasi akun Anda" />
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 36, fontWeight: 700, flexShrink: 0
        }}>
          {user.initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 24, color: 'var(--text-primary)' }}>{user.name}</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-secondary)' }}>{user.role}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
              <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8, marginTop: 4, color: 'var(--text-primary)' }}>
                {user.email}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Status Akun</label>
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 8, marginTop: 4, fontWeight: 600, width: 'fit-content' }}>
                Aktif
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
