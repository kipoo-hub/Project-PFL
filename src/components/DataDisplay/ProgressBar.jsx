import React from 'react';

const ProgressBar = ({ label, percentage, style }) => {
  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{percentage}%</span>
        </div>
      )}
      <div style={{ height: 6, width: '100%', background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-blue)', borderRadius: 3 }} />
      </div>
    </div>
  );
};

export default ProgressBar;
