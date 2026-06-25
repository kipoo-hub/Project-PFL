import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const inputStyle = {
  width: '100%', padding: '10px 12px 10px 38px',
  border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
  color: '#1e2130', background: '#f9fafb', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};

const focusStyle = (e) => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)'; };
const blurStyle  = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };

const Field = ({ label, icon: Icon, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
      {children}
    </div>
  </div>
);

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Cek apakah email sudah ada di tabel admins
    const { data: existingUser } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      setError('Email admin sudah terdaftar.');
      setLoading(false);
      return;
    }

    // Insert admin baru
    const { error } = await supabase
      .from('admins')
      .insert([{ name, email, password, role }]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#14b8a6',
            color: 'white',
            marginBottom: '16px'
          }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Buat Akun Admin</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Daftarkan akun administrator baru.</p>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <Field label="Nama Lengkap" icon={User}>
            <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Nama Admin" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Email" icon={Mail}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@klinik.com" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Role" icon={Shield}>
            <select value={role} onChange={e => setRole(e.target.value)} style={{...inputStyle, appearance: 'none'}} onFocus={focusStyle} onBlur={blurStyle}>
              <option value="admin">Administrator</option>
              <option value="staff">Staf Klinik</option>
            </select>
          </Field>
          <Field label="Password" icon={Lock}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 karakter"
              required
              style={{ ...inputStyle, paddingRight: 38 }}
              onFocus={focusStyle} onBlur={blurStyle}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? '#99f6e4' : '#14b8a6',
              color: 'white', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
              marginTop: 24
            }}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sebagai Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 24 }}>
          Sudah punya akun?{' '}
          <Link to="/admin/login" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
