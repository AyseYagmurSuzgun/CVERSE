import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import { staggerContainer, slideUp } from "../animations";
import { useSignalR } from "../context/SignalRContext";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";

const Messages = () => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    loadConversations,
  } = useSignalR();

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const openNewChatModal = async () => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError("");
    try {
      const response = await apiService.getDiscoverUsers();
      if (response.basarili) {
        setDiscoverUsers(response.data || []);
      } else {
        setModalError(response.mesaj || "Kullanıcılar yüklenemedi.");
      }
    } catch (err) {
      console.error("Discover users error:", err);
      setModalError("Kullanıcılar listelenirken hata oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  const startNewChat = async (targetUserId) => {
    try {
      setModalLoading(true);
      const response = await apiService.createConversation(targetUserId);
      if (response.basarili && response.data) {
        const conversationId = response.data.conversationId || response.data.ConversationId;
        if (conversationId) {
          await loadConversations();
          setActiveConversationId(conversationId);
          setIsModalOpen(false);
          setModalSearchQuery("");
        } else {
          setModalError("Sohbet başlatılamadı.");
        }
      } else {
        setModalError(response.mesaj || "Sohbet başlatılamadı.");
      }
    } catch (err) {
      console.error("Start new chat error:", err);
      setModalError("Sohbet başlatılırken bir hata oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `http://localhost:5145${url.startsWith("/") ? url : "/" + url}`;
  };

  const activeContact = conversations.find(c => {
    const cId = c.id || c.Id;
    return cId && activeConversationId && String(cId).toLowerCase() === String(activeConversationId).toLowerCase();
  });

  // KORUMA: Kullanıcı oturumu tamamen değiştiğinde eski seçili sohbet ID'sini zorla sıfırla
  useEffect(() => {
    setActiveConversationId(null);
  }, [user?.id, user?.Id, setActiveConversationId]);

  // Otomatik ilk sohbeti seçme mekanizması (Eğer seçili yoksa ve liste doluysa)
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id || conversations[0].Id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  // Mesajlar değiştikçe veya birisi yazıyor durumuna geçtiğinde alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, typingUsers]);

  // Sohbet değiştirme tıklandığında eski inputu ve yazıyor durumunu temizle
  const handleSelectConversation = (id) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && activeContact) {
      sendTypingStatus(activeContact.participantId, false);
    }
    isTypingRef.current = false;
    setMessageText(""); // Yazılan metni sıfırla
    setActiveConversationId(id); // Yeni ID'yi set et
  };

  // Yazıyor... durum yönetimi
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    if (!activeContact) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(activeContact.participantId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(activeContact.participantId, false);
    }, 2000);
  };

  // Mesaj Gönderme Tetikleyicisi
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContact) return;

    const content = messageText.trim();
    setMessageText("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    sendTypingStatus(activeContact.participantId, false);

    try {
      await sendMessage(activeContact.participantId, content);
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastMsgTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Dün";
    }
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isOtherUserOnline = activeContact ? onlineUsers.has(String(activeContact.participantId).toLowerCase()) : false;
  const isOtherUserTyping = activeContact ? typingUsers[String(activeContact.participantId).toLowerCase()] === true : false;

  return (
    <motion.div
      className="max-w-6xl mx-auto h-[calc(100vh-10rem)] grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch select-none"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* SOL BÖLME: Sohbet Listesi */}
      <motion.div className="col-span-1 md:col-span-4 flex flex-col min-h-0" variants={slideUp}>
        <Card variant="primary" animate={false} className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2 select-none shrink-0">
            <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">
              Sohbetler
            </h3>
            <button
              type="button"
              onClick={openNewChatModal}
              className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 duration-200"
              title="Yeni Sohbet Başlat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {conversations.length === 0 ? (
              <div className="text-center text-text-secondary text-xs py-8">
                Henüz aktif bir sohbetiniz yok. Bir sohbet başlatarak mesajlaşmaya başlayabilirsiniz!
              </div>
            ) : (
              conversations.map((contact) => {
                const contactParticipantId = contact.participantId || contact.ParticipantId;
                const contactId = contact.id || contact.Id;
                const isOnline = contactParticipantId ? onlineUsers.has(String(contactParticipantId).toLowerCase()) : false;
                const hasUnread = (contact.unreadMessagesCount || contact.UnreadMessagesCount || 0) > 0;
                return (
                  <div
                    key={contactId}
                    onClick={() => handleSelectConversation(contactId)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      activeConversationId && contactId && String(activeConversationId).toLowerCase() === String(contactId).toLowerCase()
                        ? "bg-primary/10 border border-primary/20 text-text-primary"
                        : "hover:bg-primary/5 border border-transparent text-text-primary"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar
                        src={getImageUrl(contact.participantProfilFotografiUrl)}
                        name={contact.participantAdSoyad}
                        size="md"
                        isOnline={isOnline}
                        animate={false}
                      />
                      <div className="min-w-0">
                        <h4 className={`text-xs truncate w-32 md:w-28 lg:w-36 font-semibold text-text-primary`}>
                          {contact.participantAdSoyad}
                        </h4>
                        <p className={`text-[10px] truncate block mt-0.5 ${hasUnread ? 'text-primary font-bold' : 'text-text-secondary font-semibold'}`}>
                          {contactParticipantId && typingUsers[String(contactParticipantId).toLowerCase()] ? "Yazıyor..." : (contact.lastMessageContent || contact.LastMessageContent || "Mesaj bulunmuyor")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-1">
                      <span className={`text-[9px] font-bold ${hasUnread ? 'text-primary' : 'text-text-secondary'}`}>
                        {formatLastMsgTime(contact.lastMessageAt || contact.LastMessageAt)}
                      </span>
                      {hasUnread && (
                        <span className="mt-1 bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                          {contact.unreadMessagesCount || contact.UnreadMessagesCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      {/* SAĞ BÖLME: Aktif Mesajlaşma Alanı */}
      <motion.div className="col-span-1 md:col-span-8 flex flex-col min-h-0" variants={slideUp}>
        {activeContact ? (
          <Card variant="primary" animate={false} className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden relative">
            {/* Sohbet Üst Alanı */}
            <div className="px-6 py-4 bg-card-secondary/30 border-b border-border-soft flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <Avatar
                  src={getImageUrl(activeContact.participantProfilFotografiUrl)}
                  name={activeContact.participantAdSoyad}
                  size="md"
                  isOnline={isOtherUserOnline}
                  animate={false}
                />
                <div>
                  <h3 className="text-sm font-bold text-text-primary leading-tight">
                    {activeContact.participantAdSoyad}
                  </h3>
                  <span className="text-[10px] text-text-secondary font-semibold block mt-0.5">
                    {isOtherUserOnline ? (
                      <span className="text-green-500 font-bold">Çevrimiçi</span>
                    ) : activeContact.lastSeen || activeContact.LastSeen ? (
                      <span>Son görülme: {new Date(activeContact.lastSeen || activeContact.LastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                      <span>Çevrimdışı</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Konuşma Balonları */}
            <div className="flex-1 overflow-y-auto p-6 bg-card-primary/10 space-y-4 min-h-0">
              <AnimatePresence initial={false}>
                {activeMessages && activeMessages.length > 0 ? (
                  activeMessages.map((msg) => {
                    const msgSenderId = msg.senderId || msg.SenderId;
                    const isMe = String(msgSenderId).toLowerCase() === String(user?.id || user?.Id).toLowerCase();
                    const msgContent = msg.content || msg.Content;
                    const msgSentAt = msg.sentAt || msg.SentAt;
                    const msgIsRead = msg.isRead ?? msg.IsRead ?? false;

                    return (
                      <motion.div
                        key={msg.id || msg.Id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm relative ${
                            isMe
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-card-secondary text-text-primary border border-border-soft rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msgContent}</p>
                          
                          <div className="flex items-center justify-end gap-1 mt-1 shrink-0">
                            <span className={`text-[8px] font-bold ${isMe ? "text-white/70" : "text-text-secondary"}`}>
                              {formatMessageTime(msgSentAt)}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-bold">
                                {msgIsRead ? (
                                  <svg className="w-3.5 h-3.5 text-sky-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center text-text-secondary text-xs py-12 font-bold">
                    Bu konuşmada henüz bir mesaj bulunmuyor. İlk mesajı siz yazın!
                  </div>
                )}

                {/* Karşı Taraf Yazıyor... */}
                {isOtherUserTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="bg-card-secondary border border-border-soft rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1.5 items-center shadow-sm">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Gönderme Çubuğu */}
            <form onSubmit={handleSendMessage} className="p-4 bg-card-secondary/30 border-t border-border-soft flex items-center space-x-3 shrink-0">
              <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                placeholder="Bir mesaj yazın..."
                className="flex-1 px-4 py-3 bg-bg-app border border-border-soft text-text-primary rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              />
              <Button
                type="submit"
                variant="primary"
                className="!p-3 rounded-2xl shadow-md shadow-primary/10 shrink-0"
                disabled={!messageText.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </Button>
            </form>
          </Card>
        ) : (
          <Card variant="secondary" className="flex-1 flex items-center justify-center border border-dashed border-border-soft rounded-3xl p-8 text-center text-text-secondary text-sm" animate={false}>
            Mesajları görüntülemek için sol taraftan bir sohbet seçin.
          </Card>
        )}
      </motion.div>

      {/* YENİ SOHBET BAŞLAT MODALI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-card/90 backdrop-blur-xl border border-border-soft w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[500px] z-10 text-text-primary"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-text-primary tracking-tight">Yeni Sohbet</h3>
                  <p className="text-[10px] text-text-secondary font-bold mt-0.5">Mesajlaşmak için bir kullanıcı seçin</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-primary/10 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4 shrink-0">
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="İsim veya kullanıcı adı ara..."
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-soft text-text-primary rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
                <svg className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
                {modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kullanıcılar Yükleniyor...</span>
                  </div>
                ) : modalError ? (
                  <div className="text-center text-rose-500 text-xs py-8 font-semibold">{modalError}</div>
                ) : (
                  (() => {
                    const filtered = discoverUsers.filter(u => {
                      const name = (u.adSoyad || u.AdSoyad || "").toLowerCase();
                      const username = (u.userName || u.UserName || "").toLowerCase();
                      const query = modalSearchQuery.toLowerCase();
                      return name.includes(query) || username.includes(query);
                    });
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center text-text-secondary text-xs py-8 font-bold">
                          Arama kriterlerine uygun kullanıcı bulunamadı.
                        </div>
                      );
                    }

                    return filtered.map(user => {
                      const photoUrl = user.profilFotografiUrl || user.ProfilFotografiUrl;
                      return (
                        <div
                          key={user.userId || user.UserId}
                          onClick={() => startNewChat(user.userId || user.UserId)}
                          className="flex items-center space-x-3 p-2.5 rounded-2xl cursor-pointer hover:bg-primary/5 border border-transparent hover:border-border-soft transition-all group"
                        >
                          <Avatar
                            src={getImageUrl(photoUrl)}
                            name={user.adSoyad || user.AdSoyad}
                            size="md"
                            animate={false}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                              {user.adSoyad || user.AdSoyad}
                            </h4>
                            <p className="text-[10px] font-bold text-text-secondary mt-0.5">
                              {user.unvan || `@${user.userName || user.UserName}`}
                            </p>
                          </div>
                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-primary/10 text-primary text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Sohbet Et
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Messages;
