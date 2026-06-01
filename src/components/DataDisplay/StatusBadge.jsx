import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status, style }) => {
  const config = {
    'Selesai':           { bg: '#e6fcf5', color: '#0ca678', icon: CheckCircle2 },
    'Sedang Berjalan':   { bg: '#eef2ff', color: '#3b5bdb', icon: Clock },
    'Menunggu':          { bg: '#fff4e6', color: '#f76707', icon: Clock },
    'Dibatalkan':        { bg: '#fff5f5', color: '#e03131', icon: XCircle },
  };
  const c = config[status] || { bg: '#f3f4f6', color: '#6b7280', icon: Clock };
  const Icon = c.icon;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
      width: 'max-content',
      ...style
    }}>
      <Icon size={11} />
      {status}
    </span>
  );
};

export default StatusBadge;
