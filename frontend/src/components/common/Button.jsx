import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { buttonVariants } from '../../animations';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10",
    secondary: "bg-secondary hover:bg-secondary-dark text-white shadow-md shadow-secondary/10",
    ghost: "bg-transparent hover:bg-card text-text-primary border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10",
    glass: "glassmorphism text-text-primary hover:bg-card-primary/80"
  };

  const sizes = {
    sm: "px-4 py-2.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <motion.button
      type={type}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled || loading ? "rest" : "hover"}
      whileTap={disabled || loading ? "rest" : "tap"}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <Loader2 className="w-4.5 h-4.5 animate-spin" />
          <span>Lütfen Bekleyin...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
