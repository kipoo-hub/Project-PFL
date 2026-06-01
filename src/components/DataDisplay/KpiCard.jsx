import React from 'react';
import Card from '../Layout/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KpiCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendValue, style }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
    </div>
    {trendValue !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 8px',
          borderRadius: 20,
          background: trend === 'up' ? 'var(--accent-teal-light)' : 'var(--accent-red-light)',
          color: trend === 'up' ? 'var(--accent-teal)' : 'var(--accent-red)',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs bulan lalu</span>
      </div>
    )}
  </Card>
);

export default KpiCard;
