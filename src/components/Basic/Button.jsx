import React from 'react';

const Button = ({ children, variant = 'primary', icon, onClick, style, ...props }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...style
  };

  const variants = {
    primary: {
      padding: '8px 16px',
      border: 'none',
      background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
      color: 'white',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(59,91,219,0.3)'
    },
    outline: {
      padding: '8px 14px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      color: 'var(--text-secondary)',
      boxShadow: 'var(--shadow-sm)'
    },
    danger: {
      padding: '8px 16px',
      border: 'none',
      background: 'var(--accent-red-light)',
      color: 'var(--accent-red)',
      fontWeight: 600
    },
    icon: {
      position: 'relative',
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
      padding: 0
    }
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} onClick={onClick} {...props}>
      {icon && icon}
      {variant !== 'icon' && children}
    </button>
  );
};

export default Button;
