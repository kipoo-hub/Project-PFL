import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const inputStyle = {
  width: '100%', padding: '10px 12px 10px 38px',
  border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
  color: '#1e2130', background: '#f9fafb', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    setLoading(false);

    if (error || !data) {
      setError('Email atau password admin salah');
    } else {
      localStorage.setItem('adminUser', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'admin',
        created_at: data.created_at
      }));
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2130', marginBottom: 6 }}>
        Selamat Datang, Admin!
      </h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
        Masuk ke akun klinik Anda untuk mengelola sistem.
      </p>

      {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Admin</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@petcare.com"
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Password</label>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ ...inputStyle, paddingRight: 38 }}
              onFocus={e => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: loading ? '#93a5e8' : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)', transition: 'all 0.2s',
          }}
        >
          {loading ? 'Masuk...' : <><LogIn size={15} /> Masuk sebagai Admin</>}
        </button>
      </form>
    </div>
  );
}
