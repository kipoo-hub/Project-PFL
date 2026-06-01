import React from 'react';

const Card = ({ children, style, padding = '20px 22px', ...props }) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      padding: padding,
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-color)',
      ...style
    }} {...props}>
      {children}
    </div>
  );
};

export default Card;
