import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      flex: 1,
      minHeight: '100%',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 24,
          background: 'linear-gradient(135deg, #eef2ff, #f3f0ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(59,91,219,0.12)',
        }}>
          <PawPrint size={44} color="#3b5bdb" />
        </div>

        {/* 404 Number */}
        <div style={{
          fontSize: 80, fontWeight: 800, lineHeight: 1,
          background: 'linear-gradient(135deg, #3b5bdb, #7048e8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}>
          404
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 10,
        }}>
          Halaman Tidak Ditemukan
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
          marginBottom: 32,
        }}>
          Sepertinya hewan peliharaan Anda kabur ke URL yang salah! 🐾<br />
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="notfound-back-btn"
            onClick={() => window.history.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'white', color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={15} />
            Kembali
          </button>

          <Link
            id="notfound-home-btn"
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
              color: 'white', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(59,91,219,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,91,219,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,91,219,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Home size={15} />
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
