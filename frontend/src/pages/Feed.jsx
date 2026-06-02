import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// POST CARD COMPONENT
const PostCard = ({ post, onLike, onComment, onRepost }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <Card variant="default" animate={false} className="p-5 shadow-premium border border-border-soft mb-4 h-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 cursor-pointer">
          <Avatar src={getImageUrl(post.profileImage)} name={post.adSoyad} size="md" className="ring-2 ring-border-soft" />
          <div>
            <h4 className="text-sm font-bold text-text-primary hover:underline">{post.adSoyad}</h4>
            <p className="text-[11px] text-text-secondary font-medium">{post.unvan || `@${post.userName}`}</p>
            <span className="text-[10px] text-text-secondary/70">{new Date(post.createdAt).toLocaleString("tr-TR")}</span>
          </div>
        </div>
        <button className="text-text-secondary hover:text-text-primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg></button>
      </div>

      {/* Content */}
      <div className="mt-3 text-sm text-text-primary whitespace-pre-line leading-relaxed">
        {post.content}
      </div>

      {/* Images Grid */}
      {post.images && post.images.length > 0 && (
        <div className={`mt-3 grid gap-1.5 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, idx) => (
            <img key={idx} src={getImageUrl(img)} alt="Post Image" className="w-full h-auto max-h-96 object-cover bg-bg-app border border-border-soft" />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-3 text-text-secondary">
        <button onClick={() => onLike(post.id)} className={`flex items-center space-x-1.5 text-xs font-bold transition-colors ${post.isLikedByCurrentUser ? 'text-rose-500' : 'hover:text-rose-500'}`}>
          <svg className={`w-5 h-5 ${post.isLikedByCurrentUser ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={post.isLikedByCurrentUser ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span>{post.likeCount} Beğeni</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1.5 text-xs font-bold hover:text-primary transition-colors">
          <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span>{post.commentCount} Yorum</span>
        </button>
        <button onClick={() => onRepost(post.id)} className={`flex items-center space-x-1.5 text-xs font-bold transition-colors ${post.isRepostedByCurrentUser ? 'text-emerald-500' : 'hover:text-emerald-500'}`}>
          <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span>{post.repostCount} Paylaşım</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4">
            <div className="border-t border-border-soft pt-4 space-y-3">
              {post.recentComments?.map(comment => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar src={getImageUrl(comment.profileImage)} name={comment.adSoyad} size="sm" />
                  <div className="bg-bg-app border border-border-soft p-2.5 rounded-2xl rounded-tl-none flex-1">
                    <h5 className="text-[11px] font-bold text-text-primary">{comment.adSoyad}</h5>
                    <p className="text-xs text-text-primary mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={handleCommentSubmit} className="flex space-x-2 items-center mt-2">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Bir yorum yazın..." className="flex-1 bg-bg-app border border-border-soft rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <Button type="submit" variant="primary" className="rounded-full !p-2 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// FEED MAIN COMPONENT
export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const fetchFeed = async () => {
    try {
      const raw = await apiService.getFeed();
      const res = normalizeResponse(raw);
      if (res.basarili && res.data) setPosts(res.data);
    } catch (err) {
      console.error("Feed hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPostImages(files);
      setImagePreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && (!postImages || postImages.length === 0)) return;
    
    try {
      const raw = await apiService.createPost(postContent, postImages);
      const res = normalizeResponse(raw);
      if (res.basarili) {
        setPostContent("");
        setPostImages(null);
        setImagePreviews([]);
        if (res.data) setPosts([res.data, ...posts]); // Optimistic UI Insert
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      // Optimistic UI Update
      setPosts(posts.map(p => p.id === postId ? {
        ...p, isLikedByCurrentUser: !p.isLikedByCurrentUser, likeCount: p.isLikedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1
      } : p));
      await apiService.toggleLike(postId);
    } catch (err) { fetchFeed(); }
  };

  const handleComment = async (postId, content) => {
    try {
      const raw = await apiService.addComment(postId, content);
      const res = normalizeResponse(raw);
      if (res.basarili) {
        setPosts(posts.map(p => p.id === postId ? {
          ...p, commentCount: p.commentCount + 1, recentComments: [res.data, ...(p.recentComments || [])]
        } : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleRepost = async (postId) => {
    try {
      setPosts(posts.map(p => p.id === postId ? {
        ...p, isRepostedByCurrentUser: !p.isRepostedByCurrentUser, repostCount: p.isRepostedByCurrentUser ? p.repostCount - 1 : p.repostCount + 1
      } : p));
      await apiService.toggleRepost(postId);
    } catch (err) { fetchFeed(); }
  };

  if (loading) return <div className="min-h-screen flex justify-center mt-20"><Loader size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pb-20 px-4">
      
      {/* LEFT SIDEBAR (Profil Özeti) */}
      <div className="hidden md:block md:col-span-3">
        <Card variant="secondary" animate={false} className="p-4 shadow-premium border border-border-soft text-center sticky top-24 h-auto">
          <Avatar src={getImageUrl(user?.profilFotografiUrl || user?.ProfilFotografiUrl)} name={user?.adSoyad || user?.AdSoyad} size="xl" className="mx-auto border-4 border-border-soft shadow-premium -mt-10" />
          <h3 className="mt-3 font-black text-text-primary text-sm">{user?.adSoyad || user?.AdSoyad}</h3>
          <p className="text-[11px] text-text-secondary font-bold mb-4">{user?.email || user?.Email}</p>
          <div className="flex justify-around border-t border-border-soft pt-3 text-xs font-bold text-text-secondary">
            <div className="flex flex-col"><span>Bağlantılar</span><span className="text-primary mt-0.5">342</span></div>
            <div className="flex flex-col"><span>Görüntülenme</span><span className="text-primary mt-0.5">89</span></div>
          </div>
        </Card>
      </div>

      {/* MIDDLE CONTENT (Feed & Create Post) */}
      <div className="col-span-1 md:col-span-6 space-y-4">
        {/* Create Post Box */}
        <Card variant="primary" animate={false} className="p-4 shadow-premium border border-border-soft h-auto">
          <div className="flex space-x-3">
            <Avatar src={getImageUrl(user?.profilFotografiUrl || user?.ProfilFotografiUrl)} name={user?.adSoyad || user?.AdSoyad} size="md" />
            <form onSubmit={handleCreatePost} className="flex-1">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Bugün ne düşünüyorsunuz?"
                className="w-full bg-bg-app border border-border-soft rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-text-primary"
                rows="2"
              />
              
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} className="h-16 w-16 object-cover rounded-lg border border-border-soft" alt="Preview" />
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-text-secondary hover:text-primary transition-colors flex items-center space-x-1 p-2 rounded-lg hover:bg-primary/5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-bold">Medya Ekle</span>
                </button>
                <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <Button type="submit" variant="primary" className="rounded-full px-5 py-1.5 text-xs font-bold">Paylaş</Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Posts Stream */}
        {posts.map(post => (
          <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} onRepost={handleRepost} />
        ))}
      </div>

      {/* RIGHT SIDEBAR (Öneriler) */}
      <div className="hidden md:block md:col-span-3">
        <Card variant="success" animate={false} className="p-4 shadow-premium border border-border-soft sticky top-24 h-auto">
          <h3 className="font-extrabold text-text-primary text-xs mb-4">Gündemdeki Konular</h3>
          <div className="space-y-3 text-[11px] font-bold text-text-secondary">
            <p className="cursor-pointer hover:text-primary">#YapayZeka</p>
            <p className="cursor-pointer hover:text-primary">#CverseAğı</p>
            <p className="cursor-pointer hover:text-primary">#YazılımGeliştirme</p>
          </div>
        </Card>
      </div>

    </div>
  );
}
