import React from 'react';

const Divider = ({ text, style }) => {
  if (!text) {
    return <div style={{ height: 1, background: 'var(--border-color)', width: '100%', ...style }} />;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', ...style }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
    </div>
  );
};

export default Divider;
