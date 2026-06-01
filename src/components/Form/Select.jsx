import React from 'react';

const Select = ({ options = [], style, ...props }) => {
  return (
    <select
      style={{
        width: '100%',
        padding: '9px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        fontSize: 14,
        color: 'var(--text-primary)',
        background: 'var(--bg-card)',
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--accent-blue)';
        e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.1)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  );
};

export default Select;
