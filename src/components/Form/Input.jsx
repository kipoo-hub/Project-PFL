import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ icon: Icon, type = 'text', style, ...props }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPass ? 'text' : type;

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      {Icon && (
        <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      )}
      <input
        type={inputType}
        style={{
          width: '100%',
          padding: '10px 12px',
          paddingLeft: Icon ? 38 : 12,
          paddingRight: isPassword ? 38 : 12,
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--text-primary)',
          background: 'var(--bg-app)',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s'
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
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 0
          }}
        >
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
};

export default Input;
