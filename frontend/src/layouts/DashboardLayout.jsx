import React, { useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { useSignalR } from "../context/SignalRContext";
import GameFloatingWidget from "../components/GameFloatingWidget";


const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = "http://localhost:5145";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const DashboardLayout = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setActiveConversationId
  } = useSignalR();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.email === "admin@cverse.com" || user?.kullaniciAdi === "admin" || user?.kullaniciAdi?.toLowerCase().includes("admin");

  React.useEffect(() => {
    const stored = localStorage.getItem("cverse_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  React.useEffect(() => {
    if (isAdmin) {
      const path = location.pathname;
      // Admin sadece /admin ve /profile/* sayfalarına erişebilir
      const isAllowed = path === "/admin" || path.startsWith("/admin/") || 
                        path === "/profile" || path.startsWith("/profile/");
      if (!isAllowed) {
        navigate("/admin", { replace: true });
      }
    }
  }, [isAdmin, location.pathname]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Şimdi';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    
    // Close dropdown
    setShowNotifications(false);

    // Dynamic routing depending on notification type
    if (notif.type === "Message" && notif.triggeredById) {
      // Set active conversation in SignalR context to open the chat automatically
      // We will look for an existing conversation with this user in the messages list, 
      // or simply navigating will load it.
      navigate("/messages");
    } else if (["Like", "Comment", "Repost"].includes(notif.type)) {
      navigate("/"); // Navigate to social feed
    } else if (notif.type === "Follow") {
      navigate("/discover"); // Navigate to discover/followers list
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#E1F0FA] via-[#C9E5F7] to-[#E1F0FA] dark:from-[#0B132B] dark:via-[#0B132B] dark:to-[#0B132B] transition-colors duration-300">
      {/* Mobil Menü Karartma Arka Planı (Overlay) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sol Panel: Katlanabilir Menü */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Sag Panel: Ana Alan (Topbar + Govde) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-sky-50/60 dark:bg-slate-900/90 backdrop-blur-md border-b border-sky-200/50 dark:border-slate-700/80 px-6 sm:px-8 flex items-center justify-between z-20 shrink-0 shadow-sm">
          {/* Hamburger Menu Trigger for Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Sol: Arama Cubugu */}
          {!isAdmin && (
            <div className="w-full max-w-md hidden sm:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cverse'te ara: yetenek, iş ilanı veya kişi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-blue-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 placeholder-slate-500 font-medium shadow-sm dark:bg-[#1C2541] dark:border-[#3A506B]/45 dark:text-white dark:placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Mobilde Gorunen Arama Ikonu */}
          <div className="sm:hidden text-slate-600 font-bold text-lg tracking-tight">
            {isAdmin ? "CVERSE YÖNETİCİ" : "CVERSE"}
          </div>

          {/* Sag: Bildirimler ve Hızlı Profil */}
          <div className="flex items-center space-x-4">
            {location.pathname !== "/admin" && (
              <>
                {/* Bildirim Butonu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="!p-2.5 rounded-full hover:bg-slate-50 relative text-slate-500 hover:text-slate-800 transition-colors"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {/* Unread bildirim balonu */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Bildirim Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        {/* Overlay to close */}
                        <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                        <motion.div
                          className="absolute right-0 mt-2 w-80 bg-[#EDF5FF] dark:bg-[#1C2541] rounded-3xl shadow-xl border-2 border-border-soft py-3 z-40 max-h-[400px] flex flex-col"
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <div className="px-4 py-2 border-b border-border-soft flex items-center justify-between shrink-0">
                            <h4 className="font-bold text-text-primary text-sm">Bildirimler</h4>
                            {unreadCount > 0 && (
                              <span 
                                onClick={markAllNotificationsAsRead}
                                className="text-xs text-primary font-semibold cursor-pointer hover:underline"
                              >
                                Tümünü oku
                              </span>
                            )}
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-slate-400 text-xs">
                                Henüz hiç bildiriminiz yok.
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-start space-x-3 cursor-pointer border-b border-slate-50 last:border-0 ${
                                    !notif.isRead ? "bg-primary/5" : ""
                                  }`}
                                >
                                  {/* Bildirim Ikonu / Triggerer Avatar */}
                                  {notif.triggeredBy ? (
                                    <img
                                      src={getImageUrl(notif.triggeredBy.profilFotografiUrl)}
                                      alt=""
                                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                                      }}
                                    />
                                  ) : (
                                    <span className="mt-0.5 p-1.5 rounded-xl bg-white border border-slate-100 flex shrink-0">
                                      <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                      </svg>
                                    </span>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs text-slate-700 leading-normal break-words ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                                      {notif.content}
                                    </p>
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                      {formatTimeAgo(notif.createdAt)}
                                    </span>
                                  </div>

                                  {/* Unread dot */}
                                  {!notif.isRead && (
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0 animate-pulse" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hızlı Profil Avatarı */}
                <div
                  className="flex items-center space-x-2 border-l border-slate-100 pl-4 cursor-pointer group"
                  onClick={() => navigate(isAdmin ? "/admin" : "/profile")}
                >
                  <Avatar
                    src={isAdmin ? null : getImageUrl(user?.profilFotografiUrl)}
                    name={user?.adSoyad || "Kullanıcı"}
                    size="sm"
                    isOnline={false}
                    animate={false}
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors hidden md:block">
                    {user?.adSoyad || "Kullanıcı"}
                  </span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Outlet Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 pb-24 sm:pb-8 relative">
          {/* Animated Background Blobs for Premium Sky-Blue Aesthetic */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[5%] left-[15%] w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-[110px] animate-pulse-slow" />
            <div className="absolute bottom-[15%] right-[8%] w-[450px] h-[450px] bg-blue-200/20 rounded-full blur-[130px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
            <div className="absolute top-[45%] right-[35%] w-[300px] h-[300px] bg-cyan-200/15 rounded-full blur-[90px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
          </div>

          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
        
        {/* Floating Mini Games Console Widget */}
        {!isAdmin && <GameFloatingWidget />}

        {/* Sleek Mobile Bottom Navigation Bar */}
        {!isAdmin && (
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/85 dark:bg-slate-900/90 backdrop-blur-lg border-t border-sky-100/50 dark:border-slate-800/80 flex items-center justify-around z-40 md:hidden px-2 shadow-2xl">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                  isActive ? "text-primary dark:text-sky-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[9px] mt-0.5 tracking-tight">Akış</span>
            </NavLink>

            <NavLink 
              to="/discover" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                  isActive ? "text-primary dark:text-sky-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[9px] mt-0.5 tracking-tight">Keşfet</span>
            </NavLink>

            <NavLink 
              to="/messages" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                  isActive ? "text-primary dark:text-sky-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                }`
              }
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight">Mesaj</span>
            </NavLink>

            <NavLink 
              to="/games" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                  isActive ? "text-primary dark:text-sky-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-[9px] mt-0.5 tracking-tight">Oyunlar</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                  isActive ? "text-primary dark:text-sky-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[9px] mt-0.5 tracking-tight">Profil</span>
            </NavLink>
          </nav>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;


