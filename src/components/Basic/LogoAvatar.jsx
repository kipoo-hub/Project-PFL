import React from 'react';
import { PawPrint } from 'lucide-react';

const LogoAvatar = ({ size = 40, iconSize = 20 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size >= 40 ? 10 : 8,
      background: 'linear-gradient(135deg, #3b5bdb, #7048e8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(59,91,219,0.4)',
      flexShrink: 0
    }}>
      <PawPrint size={iconSize} color="white" />
    </div>
  );
};

export default LogoAvatar;
