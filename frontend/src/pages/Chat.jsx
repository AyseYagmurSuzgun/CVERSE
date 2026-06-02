import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as signalR from "@microsoft/signalr";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:5145${url.startsWith("/") ? url : "/" + url}`;
};

const normalizeResponse = (response) => ({
  basarili: response?.basarili ?? response?.Basarili ?? false,
  mesaj: response?.mesaj || response?.Mesaj || "",
  data: response?.data ?? response?.Data ?? response?.veri ?? null
});

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const activeConvoRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Aktif sohbetin ref üzerinde güncel tutulması (SignalR event'leri için)
  useEffect(() => {
    activeConvoRef.current = activeConversation;
  }, [activeConversation]);

  // Mesajlar değiştikçe en alta kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sohbet Listesini Getir
  const fetchConversations = async () => {
    try {
      const raw = await apiService.getConversations();
      const res = normalizeResponse(raw);
      if (res.basarili && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Sohbetler getirilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde veya kullanıcı değiştiğinde SignalR bağlantısını kur ve sohbetleri çek
  useEffect(() => {
    // Yeni kullanıcı geldiğinde eski mesajlaşma panelini tamamen temizle
    setActiveConversation(null);
    setMessages([]);
    fetchConversations();

    const token = localStorage.getItem('cverse_token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5145/hubs/chat", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("Chat SignalR bağlantısı başarılı!");

        // YENİ MESAJ GELDİĞİNDE:
        connection.on("OnMessageReceived", (message) => {
          const isCurrentActive = activeConvoRef.current && activeConvoRef.current.id === message.conversationId;
          
          if (isCurrentActive) {
            setMessages(prev => {
              if (prev.some(m => m.id === message.id)) return prev; 
              return [...prev, message];
            });

            if (message.senderId !== user.id) {
              apiService.markConversationAsRead(message.conversationId);
            }
          }

          setConversations(prev => {
            const existing = prev.find(c => c.id === message.conversationId);
            let updatedList = prev.filter(c => c.id !== message.conversationId);

            if (existing) {
              const updatedConvo = {
                ...existing,
                lastMessageContent: message.content,
                lastMessageAt: message.sentAt,
                lastMessageSenderId: message.senderId,
                unreadMessagesCount: (!isCurrentActive && message.senderId !== user.id) 
                  ? existing.unreadMessagesCount + 1 
                  : existing.unreadMessagesCount
              };
              updatedList = [updatedConvo, ...updatedList];
            } else {
              fetchConversations(); 
              return prev;
            }
            return updatedList.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          });
        });

        // MESAJLAR OKUNDUĞUNDA:
        connection.on("OnMessagesRead", (conversationId) => {
          if (activeConvoRef.current && activeConvoRef.current.id === conversationId) {
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
          }
        });
      })
      .catch(err => console.error("SignalR Bağlantı Hatası: ", err));

    // Cleanup: Kullanıcı çıkış yaptığında veya değiştiğinde eski SignalR bağlantısını zorla kapat
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user?.id]); // Güvenli kullanıcı kontrolü

  // Bir sohbete tıklanıldığında geçmiş mesajları getir
  const handleSelectConversation = async (convo) => {
    // Hızlı geçiş hissi yaratmak ve eski mesajların ekranda anlık kalmasını önlemek için listeyi sıfırla
    setMessages([]);
    setActiveConversation(convo);
    
    try {
      const raw = await apiService.getMessages(convo.id);
      const res = normalizeResponse(raw);
      if (res.basarili && res.data) {
        setMessages(res.data);
        
        if (convo.unreadMessagesCount > 0) {
          await apiService.markConversationAsRead(convo.id);
          setConversations(prev => prev.map(c => 
            c.id === convo.id ? { ...c, unreadMessagesCount: 0 } : c
          ));
        }
      }
    } catch (err) {
      console.error("Mesaj geçmişi getirilemedi", err);
    }
  };

  // Yeni Mesaj Gönderme
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage;
    setNewMessage(""); 

    try {
      await apiService.sendMessage(activeConversation.participantId, content);
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center mt-20"><Loader size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto h-[85vh] mt-6 pb-6 px-4">
      <Card variant="primary" animate={false} className="h-full flex overflow-hidden p-0 shadow-premium border border-border-soft">
        
        {/* SOL PANEL: SOHBET LİSTESİ */}
        <div className="w-full md:w-1/3 border-r border-border-soft flex flex-col bg-card">
          <div className="p-4 border-b border-border-soft bg-card-primary">
            <h2 className="text-lg font-black text-text-primary">Mesajlar</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-xs text-text-secondary text-center mt-10 font-bold">Henüz mesajınız bulunmuyor.</p>
            ) : (
              conversations.map(convo => (
                <div 
                  key={convo.id} 
                  onClick={() => handleSelectConversation(convo)}
                  className={`flex items-center p-4 cursor-pointer border-b border-border-soft transition-colors hover:bg-primary/5 ${activeConversation?.id === convo.id ? 'bg-primary/10 border-l-4 border-l-primary text-text-primary' : 'border-l-4 border-l-transparent text-text-primary'}`}
                >
                  <div className="relative">
                    <Avatar src={getImageUrl(convo.participantProfilFotografiUrl)} name={convo.participantAdSoyad} size="md" />
                    {convo.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-bold text-text-primary truncate">{convo.participantAdSoyad}</h4>
                      <span className="text-text-secondary shrink-0 ml-2 font-bold text-[10px]">
                        {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className={`text-xs truncate ${convo.unreadMessagesCount > 0 ? 'text-text-primary font-extrabold' : 'text-text-secondary font-medium'}`}>
                        {convo.lastMessageSenderId === user?.id ? "Siz: " : ""}{convo.lastMessageContent}
                      </p>
                      {convo.unreadMessagesCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shrink-0 ml-2">
                          {convo.unreadMessagesCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SAĞ PANEL: MESAJLAŞMA EKRANI */}
        <div className="hidden md:flex md:w-2/3 flex-col bg-bg-app">
          {activeConversation ? (
            <>
              {/* Chat Başlığı */}
              <div className="p-4 border-b border-border-soft bg-card-secondary/30 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <Avatar src={getImageUrl(activeConversation.participantProfilFotografiUrl)} name={activeConversation.participantAdSoyad} size="sm" />
                  <div>
                    <h3 className="text-sm font-black text-text-primary">{activeConversation.participantAdSoyad}</h3>
                    <p className="text-[10px] text-text-secondary font-bold">{activeConversation.participantUnvan || "Cverse Üyesi"}</p>
                  </div>
                </div>
              </div>

              {/* Mesaj Akışı (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card-primary/10">
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm relative ${isMe ? 'bg-primary text-white rounded-tr-sm font-semibold' : 'bg-card-secondary border border-border-soft text-text-primary rounded-tl-sm font-semibold'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
                          <span className="text-[9px] font-bold">
                            {new Date(msg.sentAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <svg className={`w-3.5 h-3.5 ${msg.isRead ? 'text-[#34B7F1]' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Mesaj Gönderme Formu */}
              <div className="p-4 bg-card-secondary/30 border-t border-border-soft">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                    placeholder="Bir mesaj yazın..."
                    className="flex-1 bg-bg-app border border-border-soft text-text-primary rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none max-h-32 min-h-[44px]"
                    rows="1"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="p-3.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                    <svg className="w-5 h-5 translate-x-[1px] translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary bg-bg-app">
              <svg className="w-16 h-16 mb-4 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-bold">Mesajlaşmaya başlamak için bir sohbet seçin.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Chat;
