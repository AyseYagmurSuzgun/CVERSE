import React from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-text-secondary/50 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3.5 rounded-xl border bg-bg-app text-text-primary focus:outline-none focus:bg-card-primary text-sm font-medium transition-all duration-200
            ${Icon ? 'pl-12' : 'pl-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-border-soft focus:border-primary/50 focus:ring-4 focus:ring-primary/5'
            }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}

