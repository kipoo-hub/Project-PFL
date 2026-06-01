import React from 'react';

const LoadingSpinner = ({ text = 'Memuat...', style }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-app)', borderRadius: 8, width: 'max-content', ...style }}>
      <div style={{
        width: 24, height: 24,
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #3b5bdb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
