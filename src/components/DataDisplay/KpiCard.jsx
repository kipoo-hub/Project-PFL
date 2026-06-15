import React from 'react';
import Card from '../Layout/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KpiCard = ({ title, value, subtitle, icon: Icon, iconBg = '#4FD1C5', iconColor = '#FFFFFF', trend, trendValue, style }) => {
  const isPositive = trend === 'up';
  
  return (
    <Card style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: 'none',
      padding: '20px',
      ...style 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '30px', fontWeight: 700, color: '#2D3748', lineHeight: 1.1 }}>
            {value}
          </span>
          {trendValue !== undefined && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '2px 8px',
              borderRadius: '20px',
              background: isPositive ? '#C6F6D5' : '#FED7D7',
              color: isPositive ? '#48BB78' : '#F56565',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#A0AEC0', marginTop: 2 }} className="truncate">
            {subtitle}
          </div>
        )}
      </div>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: 12,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
    </Card>
  );
};

export default KpiCard;
