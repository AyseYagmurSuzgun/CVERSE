import React from 'react';
import logoPng from '../../assets/logo/logo.png';

export default function Logo({ className = 'w-10 h-10', animate = false }) {
  return (
    <img 
      src={logoPng} 
      alt="CVERSE Logo" 
      className={`${className} ${animate ? 'animate-float' : ''} transition-all duration-300 object-contain`}
    />
  );
}
