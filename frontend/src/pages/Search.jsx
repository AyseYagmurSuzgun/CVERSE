import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/common/Card";
import Avatar from "../components/common/Avatar";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("all"); // "all", "users", "jobs", "posts"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search Results State
  const [results, setResults] = useState({
    users: [],
    jobs: [],
    posts: []
  });

  useEffect(() => {
    if (query.trim() !== "") {
      executeSearch();
    }
  }, [query]);

  const executeSearch = async () => {
    setLoading(true);
    setError("");
    try {
      // Run concurrent requests to pull data from CVerse backend
      const [usersRes, jobsRes, feedRes] = await Promise.all([
        apiService.getDiscoverUsers().catch(() => ({ basarili: false, data: [] })),
        apiService.getJobs().catch(() => ({ basarili: false, data: [] })),
        apiService.getFeed().catch(() => ({ basarili: false, data: [] }))
      ]);

      const searchLower = query.toLowerCase().trim();

      // Client-side filtering for portfolio-grade real-time experience
      const filteredUsers = (usersRes.data || []).filter(user => 
        (user.adSoyad || "").toLowerCase().includes(searchLower) ||
        (user.kullaniciAdi || "").toLowerCase().includes(searchLower) ||
        (user.unvan || "").toLowerCase().includes(searchLower)
      );

      const filteredJobs = (jobsRes.data || []).filter(job => 
        (job.title || "").toLowerCase().includes(searchLower) ||
        (job.companyName || "").toLowerCase().includes(searchLower) ||
        (job.requiredSkills || []).some(s => s.toLowerCase().includes(searchLower)) ||
        (job.location || "").toLowerCase().includes(searchLower)
      );

      const filteredPosts = (feedRes.data || []).filter(post => 
        (post.content || "").toLowerCase().includes(searchLower) ||
        (post.authorName || "").toLowerCase().includes(searchLower)
      );

      setResults({
        users: filteredUsers,
        jobs: filteredJobs,
        posts: filteredPosts
      });
    } catch (err) {
      console.error(err);
      setError("Arama sırasında beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.users.length + results.jobs.length + results.posts.length;

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8 select-none font-sans"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Üst Kısım: Arama Sonuç Başlığı */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-primary/80 border border-border-soft backdrop-blur-md p-6 rounded-3xl shadow-premium"
        variants={slideUp}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            Arama Sonuçları
            <span className="text-[10px] tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black border border-primary/20">
              CVerse Arama
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">
            "{query}" için {loading ? "arama yapılıyor..." : `${totalResults} sonuç bulundu.`}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-bg-app border border-border-soft p-1.5 rounded-2xl shrink-0 overflow-x-auto max-w-full">
          {[
            { id: "all", label: `Tümü (${totalResults})` },
            { id: "users", label: `Kişiler (${results.users.length})` },
            { id: "jobs", label: `İlanlar (${results.jobs.length})` },
            { id: "posts", label: `Paylaşımlar (${results.posts.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-premium border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-primary/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Arama İçeriği */}
      {loading ? (
        /* Shimmer Loading Grid */
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card key={n} animate={false} variant={n % 2 === 0 ? "primary" : "secondary"} className="animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <Card variant="warning" className="p-8 text-center text-xs font-bold">
          {error}
        </Card>
      ) : totalResults === 0 ? (
        <Card variant="secondary" animate={false} className="p-12 text-center text-text-secondary backdrop-blur-md space-y-2">
          <h3 className="text-sm font-black text-text-primary">Sonuç Bulunamadı</h3>
          <p className="text-xs leading-relaxed max-w-sm mx-auto">
            Girdiğiniz kriterlere uygun kullanıcı, iş ilanı veya paylaşım bulunmuyor. Farklı anahtar kelimeler denemeyi deneyebilirsiniz.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 1. KİŞİLER (USERS) */}
          {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest text-left">Kişiler</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.users.map((user) => {
                  const targetId = user.id || user.userId || user.UserId;
                  return (
                    <motion.div
                      key={targetId}
                      onClick={() => navigate(`/profile/${targetId}`)}
                      whileHover={{ y: -4 }}
                      className="p-4 bg-card-primary border border-border-soft rounded-3xl shadow-premium card-hover-effect cursor-pointer flex items-center space-x-3 text-left"
                    >
                      <Avatar src={user.profilFotografiUrl} name={user.adSoyad} size="md" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-text-primary truncate">{user.adSoyad}</h4>
                        <p className="text-[10px] text-primary font-bold truncate">@{user.kullaniciAdi}</p>
                        <p className="text-[9px] text-text-secondary truncate mt-0.5">{user.unvan || "CVerse Üyesi"}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. İŞ İLANLARI (JOBS) */}
          {(activeTab === "all" || activeTab === "jobs") && results.jobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest text-left">İş İlanları</h3>
              <div className="space-y-3">
                {results.jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    onClick={() => navigate("/jobs")}
                    whileHover={{ y: -4 }}
                    className="p-5 bg-card-secondary border border-border-soft rounded-3xl shadow-premium card-hover-effect cursor-pointer flex justify-between items-center text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar src={job.companyLogoUrl} name={job.companyName} size="md" />
                      <div>
                        <h4 className="text-xs font-black text-text-primary leading-snug">{job.title}</h4>
                        <span className="text-[10px] text-primary font-black block mt-0.5">{job.companyName}</span>
                        <span className="text-[9px] text-text-secondary">{job.location} • {job.workType}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {job.experienceLevel}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 3. GÖNDERİLER (POSTS) */}
          {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest text-left">Paylaşımlar</h3>
              <div className="space-y-3">
                {results.posts.map((post) => (
                  <motion.div
                    key={post.id}
                    onClick={() => navigate("/")}
                    whileHover={{ y: -4 }}
                    className="p-5 bg-card-default border border-border-soft rounded-3xl shadow-premium card-hover-effect cursor-pointer text-left space-y-2.5"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar src={post.authorAvatarUrl} name={post.authorName} size="xs" />
                      <div>
                        <h4 className="text-[10px] font-black text-text-primary">{post.authorName}</h4>
                        <span className="text-[8px] text-text-secondary font-semibold">@{post.authorUsername}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-primary font-medium leading-relaxed line-clamp-2">
                      {post.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Search;
