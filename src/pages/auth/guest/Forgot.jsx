import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '10px 12px 10px 38px',
  border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
  color: '#1e2130', background: '#f9fafb', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2130', marginBottom: 6 }}>
        Lupa Password?
      </h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
        Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset password.
      </p>

      {sent ? (
        <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 10, border: '1px solid #a7f3d0', marginBottom: 20 }}>
          <p style={{ color: '#065f46', fontSize: 13, fontWeight: 500, margin: 0 }}>
            Tautan reset password telah dikirim ke <b>{email}</b>. Silakan periksa kotak masuk Anda.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="member@petcare.com"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#3b5bdb'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '11px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #3b5bdb, #4c6ef5)',
              color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(59,91,219,0.35)', transition: 'all 0.2s',
            }}
          >
            <Send size={15} /> Kirim Tautan
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/guest/login" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Kembali ke Login
        </Link>
      </p>
    </div>
  );
}
