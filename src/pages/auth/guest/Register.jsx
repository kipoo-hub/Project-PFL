import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const inputStyle = {
  width: '100%', padding: '10px 12px 10px 38px',
  border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
  color: '#1e2130', background: '#f9fafb', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};

const focusStyle = (e) => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)'; };
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

export default function Register() {
  const [name, setName] = useState('');
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

    const { data: existingUser } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      setError('Email sudah terdaftar.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .insert([{ name, email, password }]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/guest/login');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2130', marginBottom: 6 }}>Buat Akun Member Baru</h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 22 }}>Daftarkan akun untuk mengakses dashboard member.</p>

      {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <form id="register-form" onSubmit={handleSubmit}>
        <Field label="Nama Lengkap" icon={User}>
          <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Dr. Rizal Firmansyah" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>
        <Field label="Email" icon={Mail}>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="member@petcare.com" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
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
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: loading ? '#93a5e8' : 'linear-gradient(135deg, #3b5bdb, #4c6ef5)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(59,91,219,0.35)', transition: 'all 0.2s',
            marginTop: 20
          }}
        >
          {loading ? 'Mendaftarkan...' : <><UserPlus size={15} /> Daftar Sekarang</>}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
        Sudah punya akun?{' '}
        <Link to="/guest/login" style={{ color: '#3b5bdb', fontWeight: 600, textDecoration: 'none' }}>
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
