import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../animations';

export default function Card({ 
  children,
  icon: Icon, 
  title, 
  description, 
  badge,
  className = '',
  animate = true,
  onClick,
  variant = 'default'
}) {
  const CardContainer = animate ? motion.div : 'div';
  
  const variantStyles = {
    default: 'bg-card border-border-soft text-text-primary',
    primary: 'bg-card-primary border-border-soft text-text-primary',
    secondary: 'bg-card-secondary border-border-soft text-text-primary',
    warning: 'bg-card-warning border-border-soft text-text-primary',
    success: 'bg-card-success border-border-soft text-text-primary'
  };

  const badgeStyles = {
    default: 'text-primary bg-primary/10',
    primary: 'text-primary bg-primary/10',
    secondary: 'text-purple-600 bg-purple-500/10 dark:text-purple-300 dark:bg-purple-950/40',
    warning: 'text-amber-600 bg-amber-500/10 dark:text-amber-300 dark:bg-amber-950/40',
    success: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-950/40'
  };

  return (
    <CardContainer
      variants={animate ? cardHoverVariants : undefined}
      initial="rest"
      whileHover={animate ? "hover" : undefined}
      onClick={onClick}
      className={`p-8 rounded-3xl border shadow-premium card-hover-effect flex flex-col justify-between h-full ${variantStyles[variant] || variantStyles.default} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div>
        {/* Logo/Icon & Badge Row */}
        {(badge || Icon) && (
          <div className="flex items-center justify-between mb-6">
            {Icon && (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${badgeStyles[variant] || badgeStyles.default}`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            {badge && (
              <span className={`inline-block px-3 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${badgeStyles[variant] || badgeStyles.default}`}>
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {title && (
          <h3 className="text-lg font-bold text-text-primary mb-2.5 leading-snug tracking-tight">{title}</h3>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>

      {children && <div className="mt-6 w-full">{children}</div>}
    </CardContainer>
  );
}
