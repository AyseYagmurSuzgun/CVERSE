import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HttpTransportType, HubConnectionState } from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const SignalRContext = createContext(null);

export const SignalRProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Real-time State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [toasts, setToasts] = useState([]);
  const [feedUpdates, setFeedUpdates] = useState(null); // Used to pass updates to HomeFeed page

  // Connection Refs to avoid recreation and multiple connections
  const notificationConnRef = useRef(null);
  const chatConnRef = useRef(null);
  const feedConnRef = useRef(null);

  // Trigger Toast Notification
  const addToast = (content, type = 'info', triggeredBy = null) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, content, type, triggeredBy };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // REST Data Loading Helpers
  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      if (response.basarili && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.basarili && response.data !== undefined) {
        setUnreadCount(response.data);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      if (response.basarili && response.data) {
        setConversations(response.data);
        
        // Populate initial online status list based on loaded conversations
        const onlineSet = new Set();
        response.data.forEach(c => {
          const cIsOnline = c.isOnline ?? c.IsOnline;
          const cParticipantId = c.participantId || c.ParticipantId;
          if (cIsOnline && cParticipantId) {
            onlineSet.add(String(cParticipantId).toLowerCase());
          }
        });
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          onlineSet.forEach(id => next.add(id));
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await apiService.getMessages(conversationId);
      if (response.basarili && response.data) {
        // Prevent race condition if user switched chat while loading
        if (conversationId && activeConversationIdRef.current && 
            String(conversationId).toLowerCase() === String(activeConversationIdRef.current).toLowerCase()) {
          setActiveMessages(response.data);
        }
        // Mark conversation as read REST-wise
        await apiService.markConversationAsRead(conversationId);
        // Refresh conversations list to update unread badge
        loadConversations();
        loadUnreadCount();
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Notification Operations
  const markNotificationAsRead = async (id) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      if (response.basarili) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.basarili) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  // Chat Operations
  const sendMessage = async (receiverId, content) => {
    try {
      const response = await apiService.sendMessage(receiverId, content);
      if (response.basarili && response.data) {
        // Appending to active messages is handled by OnMessageReceived SignalR event
        // But in case of offline/delays, we can rely on REST too. We will rely on real-time event.
        return response.data;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const sendTypingStatus = (receiverId, isTyping) => {
    const chatConn = chatConnRef.current;
    if (chatConn && chatConn.state === HubConnectionState.Connected) {
      chatConn.invoke('SendTypingStatus', receiverId, isTyping)
        .catch(err => console.error('SendTypingStatus invoke error:', err));
    }
  };

  // Main Hub Connection Setup Effects
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect and clean up connections if logged out
      const disconnectHubs = async () => {
        if (notificationConnRef.current) {
          await notificationConnRef.current.stop().catch(() => {});
          notificationConnRef.current = null;
        }
        if (chatConnRef.current) {
          await chatConnRef.current.stop().catch(() => {});
          chatConnRef.current = null;
        }
        if (feedConnRef.current) {
          await feedConnRef.current.stop().catch(() => {});
          feedConnRef.current = null;
        }
      };
      disconnectHubs();
      
      // Clear local states
      setNotifications([]);
      setUnreadCount(0);
      setConversations([]);
      setActiveMessages([]);
      setOnlineUsers(new Set());
      setTypingUsers({});
      return;
    }

    const token = localStorage.getItem('cverse_token');
    if (!token) return;

    // Load initial data
    loadNotifications();
    loadUnreadCount();
    loadConversations();

    // 1. Establish Notification Hub Connection
    const notificationConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5145/hubs/notifications?access_token=${token}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    notificationConnection.on('OnNotificationReceived', (notificationDto) => {
      // Prepend notification
      setNotifications((prev) => [notificationDto, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger Toast popup!
      addToast(
        notificationDto.content,
        notificationDto.type,
        notificationDto.triggeredBy
      );
    });

    notificationConnection.start()
      .then(() => {
        console.log('Connected to Notification Hub successfully.');
        notificationConnRef.current = notificationConnection;
      })
      .catch((err) => console.error('Notification Hub connection failed:', err));

    // 2. Establish Chat Hub Connection
    const chatConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5145/hubs/chat?access_token=${token}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    chatConnection.on('UserOnlineStatusChanged', (userId, isOnline, timestamp) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(String(userId).toLowerCase());
        } else {
          next.delete(String(userId).toLowerCase());
        }
        return next;
      });

      // Update conversations list items presence state dynamically
      setConversations((prev) =>
        prev.map((c) => {
          const cParticipantId = c.participantId || c.ParticipantId;
          if (cParticipantId && userId && String(cParticipantId).toLowerCase() === String(userId).toLowerCase()) {
            return { ...c, isOnline, lastSeen: timestamp, IsOnline: isOnline, LastSeen: timestamp };
          }
          return c;
        })
      );
    });

    chatConnection.on('OnUserTypingStatusChanged', (senderId, isTyping) => {
      setTypingUsers((prev) => ({
        ...prev,
        [String(senderId).toLowerCase()]: isTyping,
      }));
    });

    chatConnection.on('OnMessageReceived', (messageDto) => {
      const msgConversationId = messageDto.conversationId || messageDto.ConversationId;
      const msgSenderId = messageDto.senderId || messageDto.SenderId;
      const msgId = messageDto.id || messageDto.Id;
      
      const currentActiveId = activeConversationIdRef.current;
      const isCurrentActive = 
        currentActiveId && msgConversationId && 
        String(currentActiveId).toLowerCase() === String(msgConversationId).toLowerCase();
      
      // If message is in the currently active chat page
      if (isCurrentActive) {
        setActiveMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => String(m.id || m.Id).toLowerCase() === String(msgId).toLowerCase())) return prev;
          return [...prev, messageDto];
        });

        // Trigger auto read signal back to backend REST
        const currentUserId = user?.id || user?.Id;
        if (msgSenderId && currentUserId && String(msgSenderId).toLowerCase() !== String(currentUserId).toLowerCase()) {
          apiService.markConversationAsRead(msgConversationId)
            .then(() => {
              // Tell sender that we read it
              chatConnection.invoke('MarkMessagesAsRead', msgConversationId).catch(() => {});
            })
            .catch((err) => console.error('Auto mark read failed:', err));
        }
      }

      // Reload conversations list to show last message text preview & count badge updates
      loadConversations();
    });

    chatConnection.on('OnMessagesRead', (conversationId, readerId) => {
      const currentActiveId = activeConversationIdRef.current;
      if (conversationId && currentActiveId && String(conversationId).toLowerCase() === String(currentActiveId).toLowerCase()) {
        // Mark all messages as read in our active message list
        setActiveMessages((prev) =>
          prev.map((m) => {
            const mReceiverId = m.receiverId || m.ReceiverId;
            if (mReceiverId && readerId && String(mReceiverId).toLowerCase() === String(readerId).toLowerCase()) {
              return { ...m, isRead: true, IsRead: true };
            }
            return m;
          })
        );
      }
      loadConversations();
    });

    chatConnection.start()
      .then(() => {
        console.log('Connected to Chat Hub successfully.');
        chatConnRef.current = chatConnection;
      })
      .catch((err) => console.error('Chat Hub connection failed:', err));

    // 3. Establish Feed Hub Connection
    const feedConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5145/hubs/feed?access_token=${token}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    feedConnection.on('OnNewPostReceived', (postDto) => {
      setFeedUpdates({ type: 'NEW_POST', data: postDto });
    });

    feedConnection.on('OnPostMetricsUpdated', (postId, metricType, count) => {
      setFeedUpdates({ type: 'METRICS_UPDATED', data: { postId, metricType, count } });
    });

    feedConnection.on('OnCommentAdded', (commentDto) => {
      setFeedUpdates({ type: 'COMMENT_ADDED', data: commentDto });
    });

    feedConnection.on('OnCommentMetricsUpdated', (commentId, metricType, count) => {
      setFeedUpdates({ type: 'COMMENT_METRICS_UPDATED', data: { commentId, metricType, count } });
    });

    feedConnection.start()
      .then(() => {
        console.log('Connected to Feed Hub successfully.');
        feedConnRef.current = feedConnection;
      })
      .catch((err) => console.error('Feed Hub connection failed:', err));

    return () => {
      // Clean up connections on unmount/re-evaluation
      if (notificationConnection) notificationConnection.stop().catch(() => {});
      if (chatConnection) chatConnection.stop().catch(() => {});
      if (feedConnection) feedConnection.stop().catch(() => {});
    };
  }, [isAuthenticated, user]);

  // Handle activeConversationId messages retrieval
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setActiveMessages([]);
    }
  }, [activeConversationId]);

  return (
    <SignalRContext.Provider
      value={{
        notifications,
        unreadCount,
        conversations,
        activeConversationId,
        setActiveConversationId,
        activeMessages,
        setActiveMessages,
        onlineUsers,
        typingUsers,
        toasts,
        feedUpdates,
        setFeedUpdates,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendMessage,
        sendTypingStatus,
        loadConversations,
        loadNotifications
      }}
    >
      {children}

      {/* Global Stunning UI Toast Banner Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl p-4 rounded-2xl pointer-events-auto animate-[slideIn_0.3s_ease-out] transition-all relative overflow-hidden"
          >
            {/* Ambient background accent based on type */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-fuchsia-600/5" />
            
            {/* Triggered By User Avatar */}
            {toast.triggeredBy ? (
              <img
                src={
                  toast.triggeredBy.profilFotografiUrl
                    ? `http://localhost:5145${toast.triggeredBy.profilFotografiUrl}`
                    : '/default-avatar.png'
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-violet-500/20 shadow-lg shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            )}

            {/* Notification content */}
            <div className="flex-1 min-w-0 z-10">
              <p className="text-sm font-semibold text-white truncate">
                {toast.triggeredBy?.adSoyad || 'CVERSE Bildirim'}
              </p>
              <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5">
                {toast.content}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0 z-10 self-start"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used inside a SignalRProvider');
  }
  return context;
};
