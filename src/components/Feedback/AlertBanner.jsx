import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AlertBanner = ({ type = 'info', message, style }) => {
  const config = {
    success: { bg: 'var(--accent-teal-light)', color: 'var(--accent-teal)', border: '#b2f2bb', icon: CheckCircle2 },
    error: { bg: 'var(--accent-red-light)', color: 'var(--accent-red)', border: '#fecaca', icon: AlertCircle },
    info: { bg: 'var(--accent-blue-light)', color: 'var(--accent-blue)', border: '#bac8ff', icon: Info },
  };

  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      background: c.bg,
      color: c.color,
      borderRadius: 8,
      border: `1px solid ${c.border}`,
      width: '100%',
      ...style
    }}>
      <Icon size={18} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export default AlertBanner;
