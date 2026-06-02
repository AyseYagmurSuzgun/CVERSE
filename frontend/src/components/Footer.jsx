import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full py-3.5 mt-8 bg-white/20 dark:bg-slate-900/25 backdrop-blur-md border border-sky-100/35 dark:border-slate-800/30 rounded-2xl select-none text-[10px] sm:text-xs font-bold text-[#0B2545]/60 dark:text-slate-400">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-1.5">
          <img src="/weblogo.png" alt="Cverse" className="w-4 h-4 object-contain rounded-full shrink-0" />
          <span>&copy; {new Date().getFullYear()} CVERSE</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-4">
          <Link to="/about" className="hover:text-primary dark:hover:text-sky-400 transition-colors">
            Hakkımızda
          </Link>
          <span className="w-1 h-1 rounded-full bg-slate-400/40" />
          <Link to="/contact" className="hover:text-primary dark:hover:text-sky-400 transition-colors">
            İletişim
          </Link>
        </div>
      </div>
    </footer>
  );
}
