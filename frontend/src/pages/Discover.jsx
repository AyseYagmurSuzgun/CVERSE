import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";
import { useSignalR } from "../context/SignalRContext";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = "http://localhost:5145";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const Discover = () => {
  const navigate = useNavigate();
  const { setActiveConversationId } = useSignalR();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [actionInProgress, setActionInProgress] = useState({});

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiService.getDiscoverUsers();
      if (response.basarili) {
        setUsers(response.data || []);
      } else {
        setError(response.mesaj || "Kullanıcılar getirilemedi.");
      }
    } catch (err) {
      console.error("Discover error:", err);
      setError("Kullanıcılar yüklenirken bir ağ hatası oluştu.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFollowToggle = async (targetUserId, currentStatus, targetName) => {
    if (actionInProgress[targetUserId]) return;

    setActionInProgress(prev => ({ ...prev, [targetUserId]: true }));
    try {
      const response = await apiService.toggleFollow(targetUserId);
      if (response.basarili) {
        const isNowFollowing = response.data?.isFollowing ?? !currentStatus;
        
        // Update local state immediately
        setUsers(prevUsers => 
          prevUsers.map(user => 
            (user.userId === targetUserId || user.UserId === targetUserId)
              ? { ...user, isFollowing: isNowFollowing, IsFollowing: isNowFollowing }
              : user
          )
        );

        showToast(
          "success", 
          isNowFollowing 
            ? `${targetName} başarıyla takip edildi.` 
            : `${targetName} takipten çıkarıldı.`
        );
      } else {
        showToast("error", response.mesaj || "Takip işlemi gerçekleştirilemedi.");
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      showToast("error", "Takip işlemi sırasında bir hata oluştu.");
    } finally {
      setActionInProgress(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleStartConversation = async (targetUserId, targetName) => {
    try {
      const response = await apiService.createConversation(targetUserId);
      if (response.basarili && response.data) {
        const conversationId = response.data.conversationId || response.data.ConversationId;
        if (conversationId) {
          setActiveConversationId(conversationId);
          navigate("/messages");
        } else {
          showToast("error", "Sohbet başlatılamadı.");
        }
      } else {
        showToast("error", response.mesaj || "Sohbet başlatılamadı.");
      }
    } catch (err) {
      console.error("Conversation creation error:", err);
      showToast("error", "Sohbet başlatılırken hata oluştu.");
    }
  };

  const filteredUsers = users.filter(user => {
    const name = (user.adSoyad || user.AdSoyad || "").toLowerCase();
    const username = (user.userName || user.UserName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || username.includes(query);
  });

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 select-none pb-12 font-sans"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* BAŞLIK ALANI */}
      <motion.div variants={slideUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-soft pb-5">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Kullanıcıları Keşfet</h1>
          <p className="text-xs font-semibold text-text-secondary mt-1">Cverse topluluğundaki profesyonelleri bulun ve takip edin.</p>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim veya kullanıcı adı ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-soft text-text-primary rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all font-semibold shadow-sm"
          />
          <svg
            className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </motion.div>

      {/* İÇERİK RENDERI */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-card-warning border border-border-soft rounded-3xl shadow-premium">
          <h3 className="text-lg font-black text-text-primary mb-2">Hata Oluştu</h3>
          <p className="text-sm text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchUsers()} className="rounded-2xl px-6">Tekrar Dene</Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border-soft rounded-3xl shadow-premium">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-soft">
            <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-extrabold text-text-primary tracking-tight">Kullanıcı Bulunamadı</h3>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Arama kriterlerinize uygun veya henüz kayıtlı başka bir kullanıcı bulunmuyor.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          {filteredUsers.map((user) => {
            const uid = user.userId || user.UserId || user.id || user.Id;
            const fullName = user.adSoyad || user.AdSoyad || "Cverse Üyesi";
            const uName = user.userName || user.UserName;
            const profilePhoto = getImageUrl(user.profilFotografiUrl || user.ProfilFotografiUrl);
            const coverPhoto = getImageUrl(user.kapakFotografiUrl || user.KapakFotografiUrl);
            const title = user.unvan || user.Unvan || "Cverse Üyesi";
            const bio = user.bio || user.Bio;
            const isFollowing = user.isFollowing ?? user.IsFollowing ?? false;
            const isBusy = actionInProgress[uid];

            const initials = fullName
              ? fullName.trim().split(" ").filter(Boolean)
                  .map((w, i, arr) => i === 0 || i === arr.length - 1 ? w[0] : "")
                  .join("").toUpperCase().slice(0, 2)
              : "C";

            return (
              <motion.div key={uid} variants={slideUp}>
                <Card variant="primary" animate={false} className="overflow-hidden p-0 relative shadow-premium border border-border-soft card-hover-effect flex flex-col h-[320px] rounded-3xl">
                  {/* KAPAK FOTOĞRAFI */}
                  <div className="h-24 bg-gradient-to-r from-primary-dark via-primary to-secondary relative overflow-hidden shrink-0">
                    {coverPhoto ? (
                      <img 
                        src={coverPhoto} 
                        alt="Kapak" 
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-secondary opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* PROFİL FOTOĞRAFI */}
                  <div className="px-6 relative flex flex-col items-center -mt-10 shrink-0">
                    <div className="w-20 h-20 rounded-full ring-4 ring-border-soft shadow-md bg-bg-app overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate(`/profile/${uid}`)}>
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt={fullName} 
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center">
                          <span className="text-white font-black text-lg select-none">{initials}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KULLANICI DETAYLARI */}
                  <div className="px-6 py-4 flex flex-col items-center text-center flex-1 min-h-0 cursor-pointer group/details" onClick={() => navigate(`/profile/${uid}`)}>
                    <h3 className="text-sm font-black text-text-primary tracking-tight truncate w-full group-hover/details:text-primary transition-colors duration-200">
                      {fullName}
                    </h3>
                    <span className="text-[10px] text-text-secondary font-bold bg-bg-app border border-border-soft px-1.5 py-0.5 rounded-md mt-0.5 select-none">
                      @{uName}
                    </span>
                    <p className="text-[11px] font-bold text-text-primary mt-1.5 truncate w-full">
                      {title}
                    </p>
                    {bio && (
                      <p className="text-[10px] text-text-secondary font-semibold leading-relaxed mt-2 line-clamp-2 w-full">
                        {bio}
                      </p>
                    )}
                  </div>

                  {/* DÜĞMELER GRUBU */}
                  <div className="px-6 pb-5 pt-1 mt-auto shrink-0 flex gap-2.5 w-full">
                    <Button
                      variant={isFollowing ? "ghost" : "primary"}
                      onClick={() => handleFollowToggle(uid, isFollowing, fullName)}
                      disabled={isBusy}
                      className={`text-[10px] font-extrabold tracking-wider uppercase py-2 flex-1 rounded-xl shadow-sm ${
                        isFollowing 
                          ? "!border-border-soft hover:!bg-rose-500/10 hover:!text-rose-500 hover:!border-rose-500/20" 
                          : "shadow-primary/5"
                      }`}
                    >
                      {isBusy ? (
                        <Loader size="xs" />
                      ) : isFollowing ? (
                        "Takipten Çık"
                      ) : (
                        "Takip Et"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStartConversation(uid, fullName)}
                      className="text-[10px] font-extrabold tracking-wider uppercase py-2 flex-1 rounded-xl shadow-sm border-border-soft hover:bg-primary/10 text-text-primary hover:text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Mesaj</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* TOAST BİLDİRİMİ */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-premium backdrop-blur-lg flex items-center space-x-2.5 border ${
              toast.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300"
            }`}
          >
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Discover;
