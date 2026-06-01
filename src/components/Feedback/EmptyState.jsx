import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Data Kosong', description = 'Belum ada data yang tersedia.', icon: Icon = Inbox, style }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      border: '1px dashed var(--border-color)',
      borderRadius: 8,
      width: '100%',
      textAlign: 'center',
      ...style
    }}>
      <div style={{
        width: 48,
        height: 48,
        background: 'var(--bg-app)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        color: 'var(--text-muted)'
      }}>
        <Icon size={24} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {description}
      </div>
    </div>
  );
};

export default EmptyState;
