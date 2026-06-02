import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glassmorphism transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg ring-2 ring-sky-400/40 flex items-center justify-center shrink-0 overflow-hidden p-0.5 group-hover:scale-105 transition-transform duration-300">
            <img src="/weblogo.png" alt="Cverse Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary group-hover:opacity-90 transition-opacity">
            C<span className="text-primary font-extrabold">VERSE</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-sm font-medium text-text-primary hover:text-primary transition-colors duration-200">Ana Sayfa</a>
          <a href="#ozellikler" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200">Özellikler</a>
          <a href="#mimari" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200">Mimari</a>
          <a href="#kullanicilar" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-200">Kullanıcılar</a>
        </nav>

        {/* CTA Button */}
        <div>
          <a 
            href="#kullanicilar" 
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            <span>Sistemi Keşfet</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </header>
  );
}

