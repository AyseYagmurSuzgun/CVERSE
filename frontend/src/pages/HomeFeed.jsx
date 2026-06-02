import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import Modal from "../components/common/Modal";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSignalR } from "../context/SignalRContext";

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

// POST CARD COMPONENT
const PostCard = ({ post, currentUserId, onLike, onComment, onCommentLike, onRepost, onDelete, currentUserAvatar, currentUserName, onStartConversation }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isOwner = (post.userId === currentUserId || post.UserId === currentUserId);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Az önce";
      if (diffMins < 60) return `${diffMins} dk önce`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} saat önce`;
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "Bilinmeyen tarih";
    }
  };

  return (
    <Card variant="primary" className="p-6 mb-6 hover:shadow-premium transition-all duration-300 rounded-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <Avatar 
            src={getImageUrl(post.profileImage)} 
            name={post.adSoyad} 
            size="lg" 
            className="ring-2 ring-primary/10 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => {
              if (post.userId !== currentUserId && onStartConversation) {
                onStartConversation(post.userId, post.adSoyad);
              }
            }}
          />
          <div>
            <h4 
              className="text-sm font-extrabold text-text-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                if (post.userId !== currentUserId && onStartConversation) {
                  onStartConversation(post.userId, post.adSoyad);
                }
              }}
            >
              {post.adSoyad}
            </h4>
            <p className="text-[11px] text-text-secondary font-bold tracking-tight">
              {post.unvan || `@${post.userName}`}
            </p>
            <span className="text-[9px] text-text-secondary font-semibold bg-primary/10 dark:bg-white/5 px-2 py-0.5 rounded-full mt-1 inline-block">
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>
        
        {isOwner && (
          <button 
            onClick={() => onDelete(post.id)}
            className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors duration-250 cursor-pointer"
            title="Gönderiyi Sil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 text-text-primary/95 text-sm font-medium whitespace-pre-line leading-relaxed tracking-wide">
        {post.content}
      </div>

      {/* Images Grid */}
      {post.images && post.images.length > 0 && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
          <PostImagesGrid images={post.images} />
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-text-secondary font-bold border-b border-border-soft pb-3">
        <span className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
          <span>{post.likeCount} Beğeni</span>
        </span>
        <div className="flex space-x-3">
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
            {post.commentCount} Yorum
          </span>
          <span>•</span>
          <span>{post.repostCount} Paylaşım</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center justify-between text-text-secondary">
        <Button 
          variant="ghost" 
          onClick={() => onLike(post.id)} 
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${post.isLikedByCurrentUser ? 'text-rose-600 bg-rose-500/10 hover:bg-rose-500/20' : 'hover:bg-primary/10 hover:text-primary'}`}
        >
          <svg className={`w-5 h-5 ${post.isLikedByCurrentUser ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={post.isLikedByCurrentUser ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span>{post.isLikedByCurrentUser ? 'Beğendin' : 'Beğen'}</span>
        </Button>

        <Button 
          variant="ghost" 
          onClick={() => setShowComments(!showComments)} 
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary ${showComments ? 'bg-primary/10 text-primary' : ''}`}
        >
          <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span>Yorum Yap</span>
        </Button>

        <Button 
          variant="ghost" 
          onClick={() => onRepost(post.id)} 
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${post.isRepostedByCurrentUser ? 'text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20' : 'hover:bg-primary/10 hover:text-primary'}`}
        >
          <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span>Paylaş</span>
        </Button>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden mt-4"
          >
            <div className="border-t border-slate-100 pt-4 space-y-4">
              {/* Comment Box */}
              <form onSubmit={handleCommentSubmit} className="flex space-x-3 items-center">
                <Avatar src={currentUserAvatar} name={currentUserName} size="sm" />
                <input 
                  type="text" 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)} 
                  placeholder="Harika bir gönderi! Bir fikir ekleyin..." 
                  className="flex-1 bg-app border border-border-soft rounded-2xl px-4 py-2.5 text-xs font-semibold text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card-primary transition-all" 
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="rounded-xl !px-3.5 !py-2 shrink-0 text-xs font-bold"
                  disabled={!commentText.trim()}
                >
                  Gönder
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-3.5">
                {post.recentComments && post.recentComments.length > 0 ? (
                  post.recentComments.map(comment => (
                    <div key={comment.id} className="flex space-x-3 items-start">
                      <Avatar 
                        src={getImageUrl(comment.profileImage)} 
                        name={comment.adSoyad} 
                        size="sm" 
                        className="ring-1 ring-primary/5 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          if (comment.userId !== currentUserId && onStartConversation) {
                            onStartConversation(comment.userId, comment.adSoyad);
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="bg-app/80 p-3 rounded-2xl rounded-tl-none border border-border-soft">
                          <div className="flex justify-between items-center mb-1">
                            <h5 
                              className="text-xs font-extrabold text-text-primary cursor-pointer hover:text-primary transition-colors"
                              onClick={() => {
                                if (comment.userId !== currentUserId && onStartConversation) {
                                  onStartConversation(comment.userId, comment.adSoyad);
                                }
                              }}
                            >
                              {comment.adSoyad}
                            </h5>
                          </div>
                          <p className="text-xs text-text-secondary font-medium leading-relaxed">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 pl-1 text-[10px] font-bold text-text-secondary">
                          <span>{formatTime(comment.createdAt)}</span>
                          <span>•</span>
                          <button 
                            type="button"
                            onClick={() => onCommentLike(comment.id, post.id)} 
                            className={`hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer ${comment.isLikedByCurrentUser ? 'text-rose-500 font-extrabold' : 'text-text-secondary'}`}
                          >
                            <svg className={`w-3.5 h-3.5 ${comment.isLikedByCurrentUser ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={comment.isLikedByCurrentUser ? 0 : 2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{comment.likeCount || 0} Beğeni</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-400 font-bold py-2">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// COLLAGE GRID COMPONENT FOR MULTIPLE POST IMAGES
const PostImagesGrid = ({ images }) => {
  if (!images || images.length === 0) return null;
  const count = images.length;
  if (count === 1) {
    return (
      <div className="w-full flex items-center justify-center bg-sky-50/80 dark:bg-slate-800 overflow-hidden rounded-xl border border-border-soft">
        <img 
          src={getImageUrl(images[0])} 
          alt="Gönderi resmi" 
          className="w-full h-auto object-contain hover:scale-101 transition-transform duration-500 ease-out" 
        />
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 bg-slate-100">
        <img src={getImageUrl(images[0])} alt="Görsel 1" className="w-full h-72 object-cover hover:scale-102 transition-all duration-500" />
        <img src={getImageUrl(images[1])} alt="Görsel 2" className="w-full h-72 object-cover hover:scale-102 transition-all duration-500" />
      </div>
    );
  }
  if (count === 3) {
    return (
      <div className="grid grid-cols-3 gap-1.5 bg-slate-100 h-64">
        <img src={getImageUrl(images[0])} alt="Görsel 1" className="col-span-2 w-full h-full object-cover hover:scale-101 transition-all duration-500" />
        <div className="grid grid-rows-2 gap-1.5 h-full">
          <img src={getImageUrl(images[1])} alt="Görsel 2" className="w-full h-[125px] object-cover hover:scale-103 transition-all duration-500" />
          <img src={getImageUrl(images[2])} alt="Görsel 3" className="w-full h-[125px] object-cover hover:scale-103 transition-all duration-500" />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 bg-slate-100">
      <img src={getImageUrl(images[0])} alt="Görsel 1" className="w-full h-44 object-cover hover:scale-102 transition-all" />
      <img src={getImageUrl(images[1])} alt="Görsel 2" className="w-full h-44 object-cover hover:scale-102 transition-all" />
      <img src={getImageUrl(images[2])} alt="Görsel 3" className="w-full h-44 object-cover hover:scale-102 transition-all" />
      <div className="relative w-full h-44 overflow-hidden">
        <img src={getImageUrl(images[3])} alt="Görsel 4" className="w-full h-full object-cover filter brightness-50" />
        {count > 4 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-extrabold text-lg select-none">
            +{count - 4}
          </div>
        )}
      </div>
    </div>
  );
};

// TECH NEWS SIDEBAR WIDGET
const TechNewsSidebarWidget = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwebrazzi.com%2Ffeed%2F");
        const data = await response.json();
        if (data.status === "ok" && data.items) {
          setNews(data.items.slice(0, 4));
        }
      } catch (err) {
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatNewsTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} dk önce`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} saat önce`;
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    } catch {
      return "Yeni";
    }
  };

  return (
    <Card variant="secondary" className="p-5 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-350 sticky top-6">
      <div className="flex justify-between items-center border-b border-border-soft pb-3 mb-4">
        <h4 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-1.5">
          <span>⚡</span> Güncel Teknoloji
        </h4>
        <span className="text-[10px] font-black text-primary uppercase tracking-wider">Webrazzi</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-4">
          {news.map((item, idx) => {
            const thumbUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
            
            return (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 group hover:bg-primary/10 p-2 rounded-2xl transition-all duration-200"
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt="News thumbnail"
                    className="w-12 h-12 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300 border border-slate-100/50 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100/50 dark:border-slate-800">
                    <span className="text-xs">📰</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full inline-block mb-1">
                    {item.categories && item.categories.length > 0 ? item.categories[0] : "Teknoloji"}
                  </span>
                  <h5 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h5>
                  <span className="text-[9px] text-slate-400 font-semibold mt-1 inline-block">
                    {formatNewsTime(item.pubDate)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-center text-slate-400 font-semibold py-4">Haberler şu an yüklenemedi.</p>
      )}
    </Card>
  );
};

// MAIN HOME FEED COMPONENT
const HomeFeed = () => {
  const { user } = useAuth();
  const { feedUpdates, setFeedUpdates, loadConversations, setActiveConversationId } = useSignalR();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [deletePostId, setDeletePostId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const currentUserId = user?.id || user?.Id;

  // VERI GETİRME METOTLARI
  const loadData = async () => {
    try {
      setLoading(true);
      // Profil ve Akışı eşzamanlı getir
      const [feedResponse, profileResponse] = await Promise.allSettled([
        apiService.getFeed(),
        apiService.getProfile()
      ]);

      if (feedResponse.status === "fulfilled") {
        const feed = normalizeResponse(feedResponse.value);
        if (feed.basarili && feed.data) {
          setPosts(feed.data);
        }
      }

      if (profileResponse.status === "fulfilled") {
        const prof = normalizeResponse(profileResponse.value);
        if (prof.basarili && prof.data) {
          setProfile(prof.data);
        }
      }
    } catch (err) {
      console.error("HomeFeed yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Real-time Feed Broadcast listener
  useEffect(() => {
    if (!feedUpdates) return;

    const { type, data } = feedUpdates;
    
    if (type === "NEW_POST") {
      setPosts((prev) => {
        if (prev.some((p) => p.id === data.id)) return prev;
        return [data, ...prev];
      });
    } else if (type === "METRICS_UPDATED") {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === data.postId) {
            if (data.metricType === "Like") {
              return { ...p, likeCount: data.count };
            }
            if (data.metricType === "Comment") {
              return { ...p, commentCount: data.count };
            }
            if (data.metricType === "Repost") {
              return { ...p, repostCount: data.count };
            }
          }
          return p;
        })
      );
    } else if (type === "COMMENT_ADDED") {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === data.postId) {
            const comments = p.recentComments || [];
            if (comments.some((c) => c.id === data.id)) return p;
            return {
              ...p,
              recentComments: [...comments, data]
            };
          }
          return p;
        })
      );
    } else if (type === "COMMENT_METRICS_UPDATED") {
      setPosts((prev) =>
        prev.map((p) => {
          const comments = p.recentComments || [];
          if (comments.some((c) => c.id === data.commentId)) {
            const updatedComments = comments.map((c) => {
              if (c.id === data.commentId) {
                if (data.metricType === "Like") {
                  return { ...c, likeCount: data.count };
                }
              }
              return c;
            });
            return { ...p, recentComments: updatedComments };
          }
          return p;
        })
      );
    }

    // Mark as consumed
    setFeedUpdates(null);
  }, [feedUpdates, setFeedUpdates]);

  // FILE SELECT VE PREVIEW
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...postImages, ...files];
      setPostImages(newFiles);

      const newPreviews = files.map(f => ({
        id: Math.random().toString(),
        file: f,
        url: URL.createObjectURL(f)
      }));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImagePreview = (id) => {
    const item = imagePreviews.find(p => p.id === id);
    if (item) {
      URL.revokeObjectURL(item.url);
      const filteredPreviews = imagePreviews.filter(p => p.id !== id);
      setImagePreviews(filteredPreviews);
      setPostImages(filteredPreviews.map(p => p.file));
    }
  };

  // GÖNDERİ OLUŞTURMA
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && postImages.length === 0) return;

    try {
      setSubmitting(true);
      const raw = await apiService.createPost(postContent, postImages);
      const res = normalizeResponse(raw);
      if (res.basarili) {
        setPostContent("");
        setPostImages([]);
        // revoke image previews
        imagePreviews.forEach(item => URL.revokeObjectURL(item.url));
        setImagePreviews([]);
        
        // Feed'i en baştan yenileyelim
        const rawFeed = await apiService.getFeed();
        const freshFeed = normalizeResponse(rawFeed);
        if (freshFeed.basarili && freshFeed.data) {
          setPosts(freshFeed.data);
        }
      }
    } catch (err) {
      console.error("Gönderi paylaşım hatası:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // BEĞENİ BUTONU
  const handleLike = async (postId) => {
    try {
      // Optimistic state güncellemesi
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        isLikedByCurrentUser: !p.isLikedByCurrentUser,
        likeCount: p.isLikedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1
      } : p));
      
      await apiService.toggleLike(postId);
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  // YORUM EKLEME
  const handleComment = async (postId, content) => {
    try {
      const raw = await apiService.addComment(postId, content);
      const res = normalizeResponse(raw);
      if (res.basarili && res.data) {
        setPosts(posts.map(p => p.id === postId ? {
          ...p,
          commentCount: p.commentCount + 1,
          recentComments: [...(p.recentComments || []), res.data]
        } : p));
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    }
  };

  // YORUM BEĞENİ BUTONU
  const handleCommentLike = async (commentId, postId) => {
    try {
      // Optimistic update
      setPosts(posts.map(p => {
        if (p.id === postId) {
          const updatedComments = (p.recentComments || []).map(c => {
            if (c.id === commentId) {
              const nextIsLiked = !c.isLikedByCurrentUser;
              return {
                ...c,
                isLikedByCurrentUser: nextIsLiked,
                likeCount: nextIsLiked ? (c.likeCount || 0) + 1 : Math.max(0, (c.likeCount || 0) - 1)
              };
            }
            return c;
          });
          return { ...p, recentComments: updatedComments };
        }
        return p;
      }));

      await apiService.toggleCommentLike(commentId);
    } catch (err) {
      console.error("Comment like toggle error:", err);
    }
  };

  // REPOST BUTONU
  const handleRepost = async (postId) => {
    try {
      // Optimistic update
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        isRepostedByCurrentUser: !p.isRepostedByCurrentUser,
        repostCount: p.isRepostedByCurrentUser ? p.repostCount - 1 : p.repostCount + 1
      } : p));

      await apiService.toggleRepost(postId);
    } catch (err) {
      console.error("Repost toggle error:", err);
    }
  };

  // GÖNDERİ SİLME
  const handleDeletePost = async () => {
    if (!deletePostId) return;
    try {
      setDeleting(true);
      const raw = await apiService.deletePost(deletePostId);
      const res = normalizeResponse(raw);
      if (res.basarili) {
        setPosts(posts.filter(p => p.id !== deletePostId));
        setDeletePostId(null);
      }
    } catch (err) {
      console.error("Post delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  // HIZLI SOHBET BAŞLATMA
  const handleStartConversation = async (targetUserId, targetName) => {
    try {
      const response = await apiService.createConversation(targetUserId);
      const res = normalizeResponse(response);
      if (res.basarili && res.data) {
        const conversationId = res.data.conversationId || res.data.ConversationId;
        if (conversationId) {
          await loadConversations(); // SignalRContext üzerinden sohbetleri tazele
          setActiveConversationId(conversationId);
          navigate("/messages");
        }
      }
    } catch (err) {
      console.error("HomeFeed start conversation error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <Loader size="lg" />
        <span className="text-sm font-bold text-slate-400 tracking-wider uppercase animate-pulse">CVERSE Akışı Yükleniyor...</span>
      </div>
    );
  }

  const userAvatarName = profile?.adSoyad || user?.adSoyad || user?.AdSoyad || "Cverse Adayı";
  const userTitle = profile?.unvan || "Aday";
  const userBio = profile?.bio || "Cverse ekosisteminde harika işler keşfetmeye hazır!";

  return (
    <motion.div
      className="max-w-6xl mx-auto w-full px-4 mt-6 pb-20 font-sans"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CENTERING GÖNDERİ OLUŞTURMA VE AKIŞ */}
        <motion.div className="lg:col-span-8 space-y-6" variants={slideUp}>
          {/* Gönderi Oluşturma Kutusu */}
          <Card variant="primary" className="p-5 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-350">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex space-x-3.5 items-start">
                <Avatar
                  src={getImageUrl(profile?.profilFotografiUrl || user?.profilFotografiUrl || user?.ProfilFotografiUrl)}
                  name={userAvatarName}
                  size="lg"
                />
                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Bugün ne düşünüyorsunuz? Cverse topluluğuyla paylaşın..."
                    className="w-full border-0 focus:ring-0 p-1 text-text-primary bg-transparent placeholder-text-secondary text-sm font-semibold focus:outline-none resize-none min-h-[85px] leading-relaxed"
                  />
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2.5 mt-2 pb-2 overflow-x-auto select-none">
                      {imagePreviews.map((preview) => (
                        <div key={preview.id} className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-sky-50/80 dark:bg-slate-800 group">
                          <img src={preview.url} className="h-full w-full object-cover" alt="Preview" />
                          <button
                            type="button"
                            onClick={() => removeImagePreview(preview.id)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-all duration-200 shadow"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 rounded-2xl text-text-secondary hover:text-primary transition-all duration-250 flex items-center space-x-2 bg-primary/5 hover:bg-primary/10 border border-border-soft cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[11px] font-bold">Görsel Ekle</span>
                </button>
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-6 py-2 rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer" 
                  disabled={submitting || (!postContent.trim() && postImages.length === 0)}
                >
                  {submitting ? "Paylaşılıyor..." : "Paylaş"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Akış Listesi */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={currentUserId}
                  currentUserAvatar={profile?.profilFotografiUrl || user?.profilFotografiUrl || user?.ProfilFotografiUrl}
                  currentUserName={profile?.adSoyad || user?.adSoyad || user?.AdSoyad || "Cverse Adayı"}
                  onLike={handleLike} 
                  onComment={handleComment} 
                  onCommentLike={handleCommentLike}
                  onRepost={handleRepost}
                  onDelete={(id) => setDeletePostId(id)}
                  onStartConversation={handleStartConversation}
                />
              ))
            ) : (
              <Card variant="primary" className="p-8 text-center rounded-3xl">
                <svg className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                <h4 className="text-sm font-extrabold text-text-primary mb-1">Henüz Paylaşım Yok</h4>
                <p className="text-xs text-text-secondary font-medium">İlk paylaşımı yukarıdaki kutudan yapabilirsiniz!</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* SAĞ TARAF: GÜNCEL TEKNOLOJİ HABERLERİ WIDGET'I */}
        <motion.div className="lg:col-span-4" variants={slideUp}>
          <TechNewsSidebarWidget />
        </motion.div>
      </div>

      {/* SİLME ONAY MODALİ */}
      <Modal
        isOpen={deletePostId !== null}
        onClose={() => setDeletePostId(null)}
        title="Gönderiyi Sil"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="rounded-xl px-4 py-2 text-xs font-bold border border-slate-200" 
              onClick={() => setDeletePostId(null)}
              disabled={deleting}
            >
              Vazgeç
            </Button>
            <Button 
              variant="primary" 
              className="rounded-xl px-4 py-2 text-xs font-bold !bg-rose-600 hover:!bg-rose-700 hover:shadow-lg hover:shadow-rose-600/10 text-white" 
              onClick={handleDeletePost}
              disabled={deleting}
            >
              {deleting ? "Siliniyor..." : "Evet, Sil"}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-500 font-bold leading-relaxed">
          Bu gönderiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yorumlar, beğeniler silinecektir.
        </p>
      </Modal>

    </motion.div>
  );
};

export default HomeFeed;

