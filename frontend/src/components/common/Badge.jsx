import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const baseStyle = "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/10",
    secondary: "bg-secondary/15 text-primary-dark border border-secondary/10",
    success: "bg-green-500/10 text-green-600 border border-green-500/10",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/10",
    info: "bg-blue-500/10 text-blue-600 border border-blue-500/10",
    gray: "bg-gray-100 text-gray-600 border border-gray-200"
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
