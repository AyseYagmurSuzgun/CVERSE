import React from 'react';

export default function Card({ icon: Icon, title, description, badge }) {
  return (
    <div className="bg-card-primary p-8 rounded-3xl border border-border-soft shadow-premium card-hover-effect flex flex-col justify-between h-full text-text-primary">
      <div>
        {/* Badge */}
        {badge && (
          <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-6 uppercase tracking-wider">
            {badge}
          </span>
        )}

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
          {Icon && <Icon className="w-6 h-6" />}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-3 leading-snug tracking-tight">{title}</h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
