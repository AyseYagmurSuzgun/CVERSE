import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./common/Avatar";
import { useAuth } from "../context/AuthContext";

const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = "http://localhost:5145";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const Sidebar = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/",
      label: "Ana Akış",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: "/discover",
      label: "Keşfet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      path: "/profile",
      label: "Profilim",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      path: "/cv-analysis",
      label: "ATS & CV Analizi",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      path: "/jobs",
      label: "İş İlanları",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: "/applied-jobs",
      label: "Başvurularım",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      path: "/messages",
      label: "Mesajlaşma",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      path: "/settings",
      label: "Ayarlar",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: "/admin",
      label: "Yönetici Paneli",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const isAdmin = user?.kullaniciAdi === "admin" || user?.email === "admin@cverse.com" || user?.kullaniciAdi?.toLowerCase().includes("admin");
  const visibleMenuItems = menuItems.filter(item => {
    if (isAdmin) {
      return item.path === "/admin";
    }
    return item.path !== "/admin";
  });

  return (
    <aside
      className={`h-screen flex flex-col justify-between select-none
        bg-gradient-to-b from-[#0B2545] via-[#10315B] to-[#18447E]
        border-r border-sky-950/30 shadow-2xl transition-all duration-300 z-50
        fixed md:relative inset-y-0 left-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20 w-64" : "w-64"}`}
    >
      {/* Subtle top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      
      {/* Katlama / Açma Butonu */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3.5 bg-[#0B2545] border border-sky-700/50 text-sky-300 hover:text-white hover:border-sky-400/70 rounded-full p-1 shadow-lg shadow-sky-950/40 hover:shadow-sky-800/30 transition-all z-40 hidden md:block"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Ust Kisim: Logo */}
      <div className="p-5 flex items-center space-x-3 overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-white shadow-lg ring-2 ring-sky-400/40 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
          <img src="/weblogo.png" alt="Cverse Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              className="text-xl font-extrabold text-white tracking-wider font-sans whitespace-nowrap drop-shadow-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              CVERSE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Orta Kisim: Menu Linkleri */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-xl transition-all group duration-200 relative ${
                isActive
                  ? "text-white font-semibold bg-white/10 shadow-inner shadow-sky-900/30"
                  : "text-sky-200/70 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Aktif sol kenar çizgisi */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-2 bottom-2 w-1 bg-sky-400 rounded-r-full shadow-sm shadow-sky-400/50"
                    layoutId="activeIndicator"
                  />
                )}
                <div className={`transition-transform duration-200 group-hover:scale-110 ml-1 ${
                  isActive ? "text-sky-300" : "text-sky-300/50 group-hover:text-sky-200"
                }`}>
                  {item.icon}
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="ml-3 text-sm whitespace-nowrap"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Alt Kisim: Profil Ozet & Logout */}
      <div className="p-3 border-t border-sky-950/50 space-y-2">
        {/* Kullanici Profil Bilgisi */}
        <div
          className={`flex items-center rounded-xl p-2 transition-all cursor-pointer
            ${isCollapsed ? "justify-center" : "bg-white/5 hover:bg-white/10"}`}
          onClick={() => navigate(isAdmin ? "/admin" : "/profile")}
        >
          <Avatar
            src={isAdmin ? null : getImageUrl(user?.profilFotografiUrl)}
            name={user?.adSoyad || "Kullanıcı"}
            size={isCollapsed ? "sm" : "md"}
            isOnline={true}
            animate={false}
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="ml-3 overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-xs font-bold text-white truncate w-28 leading-none">
                  {user?.adSoyad || "Kullanıcı"}
                </h4>
                <span className="text-[10px] text-sky-300/60 font-medium truncate block mt-1">
                  {user?.kullaniciAdi ? `@${user.kullaniciAdi}` : "Cverse Üyesi"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cikis Yap Butonu */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center p-2.5 rounded-xl text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-all duration-200 cursor-pointer font-medium ${
            isCollapsed ? "" : "space-x-2 text-sm"
          }`}
          title="Çıkış Yap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
