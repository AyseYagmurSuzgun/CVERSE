import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSignalR } from "../context/SignalRContext";

const AdminPanel = () => {
  const { user } = useAuth();
  const { notifications: realNotifications } = useSignalR();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactMessages, setContactMessages] = useState([]);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("cverse_theme") === "dark" ||
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cverse_theme", "dark");
      addLog("info", "Sistem teması değiştirildi: Karanlık (Dark Mode) aktif.");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cverse_theme", "light");
      addLog("info", "Sistem teması değiştirildi: Aydınlık (Light Mode) aktif.");
    }
  };

  // Strict email admin authentication check
  const isAdmin = user?.email === "admin@cverse.com";

  // Load contact messages from localStorage
  useEffect(() => {
    if (!isAdmin) return;
    const msgs = JSON.parse(localStorage.getItem("cverse_contact_messages") || "[]");
    setContactMessages(msgs);
  }, [isAdmin, activeTab]);

  const toggleMessageReadStatus = (msgId) => {
    const updated = contactMessages.map((m) => {
      if (m.id === msgId) {
        return { ...m, isRead: !(m.isRead ?? false) };
      }
      return m;
    });
    setContactMessages(updated);
    localStorage.setItem("cverse_contact_messages", JSON.stringify(updated));
  };

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = "http://localhost:5145";
    return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch real discover users for the platform user list
        const rawUsers = await apiService.getDiscoverUsers();
        let basicUsers = [];
        if (rawUsers && Array.isArray(rawUsers)) {
          basicUsers = rawUsers;
        } else if (rawUsers?.data && Array.isArray(rawUsers.data)) {
          basicUsers = rawUsers.data;
        }
        
        // Normalize basicUsers: discover API returns 'userId' not 'id', fix this
        basicUsers = basicUsers.map(u => ({
          ...u,
          id: u.userId || u.UserId || u.id || u.Id,
          kullaniciAdi: u.kullaniciAdi || u.userName || u.UserName,
          profilFotografiUrl: u.profilFotografiUrl || u.ProfilFotografiUrl,
          kapakFotografiUrl: u.kapakFotografiUrl || u.KapakFotografiUrl
        }));
        
        // 2. Fetch full profiles in background to aggregate detailed attributes
        const detailedUsers = await Promise.all(
          basicUsers.map(async (u) => {
            try {
              const res = await apiService.getProfileById(u.id);
              if (res && res.basarili && res.data) {
                const profileData = res.data;
                return { 
                  ...u, 
                  ...profileData,
                  id: u.id, // CRITICAL: PRESERVE ASPNETUSERS ID SO IT NEVER GETS OVERWRITTEN BY USERPROFILE.ID!
                  profilFotografiUrl: profileData.profilFotografiUrl || profileData.ProfilFotografiUrl || u.profilFotografiUrl,
                  kapakFotografiUrl: profileData.kapakFotografiUrl || profileData.KapakFotografiUrl || u.kapakFotografiUrl
                };
              }
              return u;
            } catch (err) {
              console.error(`Failed to fetch full profile for user ${u.id}:`, err);
              return u;
            }
          })
        );
        setUsers(detailedUsers);
        
        // 3. Fetch real active jobs
        const rawJobs = await apiService.getJobs();
        if (rawJobs && Array.isArray(rawJobs)) {
          setJobs(rawJobs);
        } else if (rawJobs?.data && Array.isArray(rawJobs.data)) {
          setJobs(rawJobs.data);
        }

        // 4. Fetch real feed posts to sum likes and comments
        const rawFeed = await apiService.getFeed();
        if (rawFeed && Array.isArray(rawFeed)) {
          setFeedPosts(rawFeed);
        } else if (rawFeed?.data && Array.isArray(rawFeed.data)) {
          setFeedPosts(rawFeed.data);
        }

        // 5. Fetch real system notifications for logs
        const rawNotifs = await apiService.getNotifications();
        if (rawNotifs && Array.isArray(rawNotifs)) {
          setNotifications(rawNotifs);
        } else if (rawNotifs?.data && Array.isArray(rawNotifs.data)) {
          setNotifications(rawNotifs.data);
        }
      } catch (err) {
        console.error("Yönetici paneli verisi alınırken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);

  // Render Premium Unauthorized Screen if user is not the strict Admin account
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card variant="default" className="p-8 text-center space-y-6 flex flex-col items-center hover:scale-[1.01] transition-transform">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center border border-rose-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Yetkisiz Erişim Engellendi</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                Bu sayfayı görüntülemek için sistem yöneticisi yetkiniz bulunmamaktadır. Platform analitik verileri sadece sistem yöneticisi (admin@cverse.com) tarafından görüntülenebilir.
              </p>
            </div>

            <div className="w-full pt-4 border-t border-sky-100/50 dark:border-slate-800/40">
              <Button
                variant="primary"
                onClick={() => navigate("/")}
                className="w-full bg-primary text-white font-bold !rounded-2xl py-3 shadow-lg shadow-primary/20"
              >
                Geri Dön
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const name = u.adSoyad || "";
    const username = u.kullaniciAdi || "";
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || username.toLowerCase().includes(query);
  });

  const filteredJobs = jobs.filter((j) => {
    const title = j.title || j.baslik || "";
    const company = j.companyName || j.sirketAdi || "";
    const query = searchTerm.toLowerCase();
    return title.toLowerCase().includes(query) || company.toLowerCase().includes(query);
  });

  const filteredPosts = feedPosts.filter((p) => {
    const name = p.adSoyad || p.AdSoyad || "";
    const content = p.content || p.icerik || "";
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || content.toLowerCase().includes(query);
  });

  // Calculate profile completeness score as dynamic ATS score representation
  const calculateAtsScore = (profile) => {
    let score = 40;
    if (profile?.unvan || profile?.Unvan) score += 10;
    if (profile?.bio || profile?.Bio) score += 10;
    if (profile?.konum || profile?.Konum) score += 5;
    if (profile?.gitHubUrl || profile?.GitHubUrl) score += 5;
    
    const skills = profile?.skills || profile?.Skills || [];
    score += Math.min(skills.length * 3, 15);
    
    const experiences = profile?.experiences || profile?.Experiences || [];
    score += Math.min(experiences.length * 5, 15);
    
    const educations = profile?.educations || profile?.Educations || [];
    score += Math.min(educations.length * 5, 10);
    
    const certificates = profile?.certificates || profile?.Certificates || [];
    score += Math.min(certificates.length * 5, 10);
    
    return score;
  };

  // Dynamic metrics aggregations
  let totalLikes = 0;
  let totalComments = 0;
  feedPosts.forEach(post => {
    const lList = post.likes || post.Likes || [];
    const cList = post.comments || post.Comments || [];
    totalLikes += lList.length;
    totalComments += cList.length;
  });

  const totalAts = users.reduce((sum, u) => sum + calculateAtsScore(u), 0);
  const avgAts = users.length > 0 ? (totalAts / users.length).toFixed(1) : "75.0";

  // Dynamic Popular Skills Calculation
  const getDynamicPopularSkills = () => {
    const allSkills = [];
    users.forEach(u => {
      const uSkills = u.skills || u.Skills || [];
      uSkills.forEach(s => {
        const skillName = s.yetenekAdi || s.YetenekAdi || "";
        if (skillName) {
          allSkills.push(skillName);
        }
      });
    });
    
    const frequencies = {};
    allSkills.forEach(s => {
      frequencies[s] = (frequencies[s] || 0) + 1;
    });
    
    const sorted = Object.keys(frequencies)
      .map(name => ({
        name,
        count: frequencies[name]
      }))
      .sort((a, b) => b.count - a.count);
      
    const maxCount = sorted[0]?.count || 1;
    const colors = ["bg-sky-500", "bg-indigo-500", "bg-teal-500", "bg-purple-500", "bg-amber-500"];
    
    const result = sorted.slice(0, 5).map((skill, index) => ({
      name: skill.name,
      count: skill.count,
      color: colors[index % colors.length],
      percentage: Math.round((skill.count / maxCount) * 100)
    }));

    if (result.length === 0) {
      return [
        { name: "React / Frontend", count: 3, color: "bg-sky-500", percentage: 100 },
        { name: ".NET Core / C#", count: 2, color: "bg-indigo-500", percentage: 67 },
        { name: "SQL Server", count: 2, color: "bg-teal-500", percentage: 67 },
        { name: "UI/UX Design", count: 1, color: "bg-purple-500", percentage: 33 },
        { name: "Python / AI", count: 1, color: "bg-amber-500", percentage: 33 },
      ];
    }
    return result;
  };

  // Dynamic System Logs mapping from real Notifications
  const getSystemLogs = () => {
    if (notifications.length === 0) {
      return [
        { id: 1, type: "success", time: "13:21:44", text: "SignalR Bildirim Hub bağlantısı aktif." },
        { id: 2, type: "info", time: "11:45:00", text: "Sistem veri eşitlemesi tamamlandı." },
        { id: 3, type: "info", time: "10:30:00", text: "Yönetici paneli güvenli oturumu başarıyla başlatıldı." }
      ];
    }
    
    return notifications.map(n => {
      const date = new Date(n.createdAt || Date.now());
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      
      let type = "info";
      if (n.type === "Like" || n.type === "Comment" || n.type === "Repost") type = "success";
      if (n.type === "Follow") type = "info";
      if (n.type === "Message") type = "warning";
      
      return {
        id: n.id,
        type,
        time: timeStr,
        text: n.content || "Sistem bildirimi alındı."
      };
    });
  };

  const addLog = (type, text, isLocalAction = false) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      time: timeStr,
      text,
      isLocalAction
    };
    setSystemLogs(prev => [newEntry, ...prev]);
  };

  // --- Admin: Delete User ---
  const handleDeleteUser = async (userId) => {
    if (!userId) {
      alert("Kullanıcı ID bulunamadı, silme iptal edildi.");
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    setDeletingUserId(userId);
    try {
      await apiService.deleteUserByAdmin(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirmUserId(null);
      addLog("warning", `Kullanıcı silindi: ${targetUser?.adSoyad || userId} (@${targetUser?.kullaniciAdi || ""})`, true);
    } catch (err) {
      console.error("Kullanıcı silinirken hata:", err);
      const msg = err?.mesaj || err?.message || "Kullanıcı silinirken bir hata oluştu.";
      alert(msg);
    } finally {
      setDeletingUserId(null);
    }
  };

  // --- Admin: Delete Job ---
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Bu iş ilanını tamamen silmek istediğinize emin misiniz?")) return;
    const targetJob = jobs.find(j => j.id === jobId);
    setDeletingJobId(jobId);
    try {
      await apiService.deleteJobByAdmin(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      addLog("warning", `İş ilanı silindi: ${targetJob?.baslik || jobId} (${targetJob?.sirketAdi || ""})`, true);
    } catch (err) {
      console.error("İş ilanı silinirken hata:", err);
      alert("İş ilanı silinirken bir hata oluştu.");
    } finally {
      setDeletingJobId(null);
    }
  };

  // --- Admin: Delete Post ---
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bu gönderiyi tamamen silmek istediğinize emin misiniz?")) return;
    const targetPost = feedPosts.find(p => p.id === postId);
    setDeletingPostId(postId);
    try {
      await apiService.deletePost(postId);
      setFeedPosts(prev => prev.filter(p => p.id !== postId));
      addLog("warning", `Gönderi silindi: ${targetPost?.adSoyad || "Kullanıcı"} tarafından paylaşılan akış gönderisi`, true);
    } catch (err) {
      console.error("Gönderi silinirken hata:", err);
      alert("Gönderi silinirken bir hata oluştu.");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Real-time Event Logs Sync with SignalR Notifications
  useEffect(() => {
    if (!isAdmin || !realNotifications) return;
    
    const mapped = realNotifications.map(n => {
      const date = new Date(n.createdAt || Date.now());
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      
      let type = "info";
      if (n.type === "Like" || n.type === "Comment" || n.type === "Repost") type = "success";
      if (n.type === "Follow") type = "info";
      if (n.type === "Message") type = "warning";
      
      return {
        id: String(n.id || Math.random().toString(36).substr(2, 9)),
        type,
        time: timeStr,
        text: n.content || "Sistem bildirimi alındı."
      };
    });
    
    setSystemLogs(prev => {
      // Keep only local admin action logs
      const localActions = prev.filter(item => item.isLocalAction);
      
      // Combine local admin logs and real notifications, avoiding duplicates by id
      const combined = [...localActions, ...mapped];
      const unique = [];
      const seen = new Set();
      combined.forEach(item => {
        const itemKey = String(item.id);
        if (!seen.has(itemKey)) {
          seen.add(itemKey);
          unique.push(item);
        }
      });
      
      return unique;
    });
  }, [realNotifications, isAdmin]);

  // Pie Chart Calculations
  const totalUsersCount = users.length;
  const totalPostsCount = feedPosts.length;
  const totalJobsCount = jobs.length;

  const getPieSlices = () => {
    const total = totalUsersCount + totalPostsCount + totalJobsCount;
    if (total === 0) return [];
    const data = [
      { label: "Kullanıcılar", value: totalUsersCount, color: "#2563EB", shadow: "rgba(37,99,235,0.4)" },
      { label: "Gönderiler", value: totalPostsCount, color: "#EC4899", shadow: "rgba(236,72,153,0.4)" },
      { label: "İş İlanları", value: totalJobsCount, color: "#059669", shadow: "rgba(5,150,105,0.4)" },
    ];

    let cumulativeAngle = -Math.PI / 2;
    return data.map((d) => {
      const fraction = d.value / total;
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + fraction * 2 * Math.PI;
      cumulativeAngle = endAngle;

      const cx = 120, cy = 120, r = 90;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArcFlag = fraction > 0.5 ? 1 : 0;

      const midAngle = (startAngle + endAngle) / 2;
      const labelRadius = r * 0.65;
      const lx = cx + labelRadius * Math.cos(midAngle);
      const ly = cy + labelRadius * Math.sin(midAngle);

      return {
        ...d,
        fraction,
        path: fraction >= 0.9999
          ? `M ${cx},${cy - r} A ${r},${r} 0 1 1 ${cx - 0.001},${cy - r} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
        labelX: lx,
        labelY: ly,
        percentage: Math.round(fraction * 100),
      };
    });
  };

  return (
    <div className="space-y-8 select-none">
      {/* Dynamic Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0B2545] via-[#10315B] to-[#18447E] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-sky-950/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-sky-400/20 border border-sky-400/40 text-sky-300 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Yönetici
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 text-xs font-semibold">Sistem Çevrimiçi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight drop-shadow-sm">
              CVERSE Yönetici Paneli
            </h1>
            <p className="text-sky-200/70 text-sm mt-1 max-w-xl font-medium">
              Platformun genel büyümesini, gerçek gönderi etkileşimlerini, dynamic yetenek dağılımlarını ve gerçek zamanlı sistem günlüklerini buradan takip edin.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="bg-white/5 hover:bg-white/10 text-white border-white/15 !rounded-2xl text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
              title={isDarkMode ? "Aydınlık Temaya Geç" : "Karanlık Temaya Geç"}
            >
              {isDarkMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-300 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span>Aydınlık Tema</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-sky-200 fill-current" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span>Karanlık Tema</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="bg-white/5 hover:bg-white/10 text-white border-white/15 !rounded-2xl text-xs py-2 px-4 shadow-sm"
            >
              Yenile
            </Button>
            <Button
              variant="primary"
              onClick={() => setActiveTab("contact_msgs")}
              className="bg-sky-400 hover:bg-sky-300 text-slate-900 border-none !rounded-2xl text-xs py-2 px-4 shadow-lg shadow-sky-400/25 font-bold"
            >
              Mesajları İncele ({contactMessages.filter(m => !(m.isRead ?? false)).length} Yeni)
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sky-200/50 dark:border-slate-800/80 gap-2 overflow-x-auto pb-px scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Genel Analiz
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Kullanıcı Dizini ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "jobs"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          İş İlanları Yönetimi ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "posts"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Gönderi Yönetimi ({feedPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("contact_msgs")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "contact_msgs"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          İletişim Mesajları ({contactMessages.filter(m => !(m.isRead ?? false)).length} Yeni)
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "logs"
              ? "border-primary text-primary dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          Sistem Olay Günlüğü
        </button>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === "overview" && (
          <>
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat Card 1: Users */}
              <Card 
                variant="default" 
                className="p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => setActiveTab("users")}
                title="Kullanıcı Dizinine Git"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Kullanıcılar</span>
                  <span className="p-2 bg-sky-100 dark:bg-sky-950/40 rounded-xl text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{loading ? "..." : totalUsersCount}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1">Platform üye dizini</p>
                </div>
              </Card>

              {/* Stat Card 2: Posts */}
              <Card 
                variant="default" 
                className="p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => setActiveTab("posts")}
                title="Gönderi Yönetimine Git"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Toplam Gönderi</span>
                  <span className="p-2 bg-violet-100 dark:bg-violet-950/40 rounded-xl text-violet-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{loading ? "..." : totalPostsCount}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1">Akış paylaşımları</p>
                </div>
              </Card>

              {/* Stat Card 3: Job Postings */}
              <Card 
                variant="default" 
                className="p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => setActiveTab("jobs")}
                title="İş İlanları Yönetimine Git"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Toplam İş İlanı</span>
                  <span className="p-2 bg-teal-100 dark:bg-teal-950/40 rounded-xl text-teal-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{loading ? "..." : totalJobsCount}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1">Aktif iş ilanları</p>
                </div>
              </Card>
            </div>

            {/* Pie Chart */}
            <div className="w-full">
              <Card variant="default" className="p-6">
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Platform Dağılım Grafiği</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kullanıcı, gönderi ve iş ilanı sayılarının canlı oransal dağılımı</p>

                {loading ? (
                  <div className="mt-8 h-56 flex items-center justify-center text-slate-400 font-bold text-sm">Veri yükleniyor...</div>
                ) : (totalUsersCount + totalPostsCount + totalJobsCount === 0) ? (
                  <div className="mt-8 h-56 flex items-center justify-center text-slate-400 font-bold text-sm">Henüz veri yok.</div>
                ) : (
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-8 justify-center">
                    {/* SVG Pie Chart */}
                    <div className="relative shrink-0">
                      <svg width="240" height="240" viewBox="0 0 240 240">
                        <defs>
                          {getPieSlices().map((slice, i) => (
                            <filter key={i} id={`pie-shadow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={slice.color} floodOpacity="0.4" />
                            </filter>
                          ))}
                        </defs>
                        {getPieSlices().map((slice, i) => (
                          <path
                            key={i}
                            d={slice.path}
                            fill={slice.color}
                            filter={`url(#pie-shadow-${i})`}
                            opacity="0.9"
                            className="transition-all duration-300 hover:opacity-100 cursor-pointer animate-pulse-slow"
                            onMouseEnter={() => setHoveredSliceIndex(i)}
                            onMouseLeave={() => setHoveredSliceIndex(null)}
                            onClick={() => {
                              if (slice.label === "Kullanıcılar") setActiveTab("users");
                              if (slice.label === "Gönderiler") setActiveTab("posts");
                              if (slice.label === "İş İlanları") setActiveTab("jobs");
                            }}
                          />
                        ))}
                        {/* Center hole for donut effect */}
                        <circle cx="120" cy="120" r="52" fill="white" className="dark:hidden" />
                        <circle cx="120" cy="120" r="52" fill="#1C2541" className="hidden dark:block" />
                        {/* Center text */}
                        <text x="120" y="114" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">Toplam</text>
                        <text x="120" y="132" textAnchor="middle" fontSize="22" className="fill-[#2563EB] dark:fill-[#38bdf8]" fontWeight="900">
                          {totalUsersCount + totalPostsCount + totalJobsCount}
                        </text>
                        {/* Interactive hover tooltips in dark navy text with soft background */}
                        {getPieSlices().map((slice, i) =>
                          hoveredSliceIndex === i ? (
                            <g key={i} className="pointer-events-none">
                              <rect
                                x={slice.labelX - 32}
                                y={slice.labelY - 14}
                                width="64"
                                height="28"
                                rx="8"
                                fill="#E6F0FA"
                                stroke="#0B2545"
                                strokeWidth="2"
                              />
                              <text
                                x={slice.labelX}
                                y={slice.labelY + 4}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#0B2545"
                                fontWeight="900"
                              >
                                {slice.percentage}%
                              </text>
                            </g>
                          ) : null
                        )}
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-4 min-w-[180px]">
                      {getPieSlices().map((slice, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-all"
                          onClick={() => {
                            if (slice.label === "Kullanıcılar") setActiveTab("users");
                            if (slice.label === "Gönderiler") setActiveTab("posts");
                            if (slice.label === "İş İlanları") setActiveTab("jobs");
                          }}
                        >
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: slice.color, boxShadow: `0 0 8px ${slice.shadow}` }} />
                          <div>
                            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 leading-tight">{slice.label}</p>
                            <p className="text-xs text-slate-400 font-medium">{slice.value} kayıt &nbsp;·&nbsp; {slice.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Popular Skills and System logs in 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular platform Skills */}
              <Card variant="default" className="p-5">
                <div className="flex items-center justify-between border-b border-sky-100/50 dark:border-slate-800/40 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Popüler Yetenekler</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Üye profillerinde en çok etiketlenen yetenek dalları</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Frekans</span>
                </div>
                
                <div className="space-y-4.5 mt-5">
                  {getDynamicPopularSkills().map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{skill.name}</span>
                        <span>{skill.count} Üye</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${skill.color}`} style={{ width: `${skill.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Mini System Logs Ticker */}
              <Card variant="default" className="p-5">
                <div className="flex items-center justify-between border-b border-sky-100/50 dark:border-slate-800/40 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Sistem Olay Günlüğü</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Gerçek veri etkileşimleri ve kullanıcı hareketleri akışı</p>
                  </div>
                  <span className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Canlı</span>
                  </span>
                </div>

                <div className="mt-4 space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                  {systemLogs.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 text-xs leading-relaxed font-semibold">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                        {log.time}
                      </span>
                      <div className="flex-1 text-slate-600 dark:text-slate-300">
                        {log.type === "success" && <span className="text-emerald-500 mr-1.5 font-bold">● SUCCESS</span>}
                        {log.type === "warning" && <span className="text-rose-500 mr-1.5 font-bold">▲ WARN</span>}
                        {log.type === "info" && <span className="text-sky-500 mr-1.5 font-bold">■ INFO</span>}
                        {log.text}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === "contact_msgs" && (
          <Card variant="default" className="p-5">
            <div className="flex items-center justify-between border-b border-sky-100/50 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Gelen İletişim & Geri Bildirim Mesajları</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ziyaretçiler tarafından kamuya açık iletişim formu üzerinden iletilen mesajlar</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {contactMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  Henüz gelen bir iletişim veya geri bildirim mesajı bulunmamaktadır.
                </div>
              ) : (
                contactMessages.map((msg) => (
                  <div key={msg.id} className="p-4.5 bg-slate-50/60 dark:bg-slate-800/25 border border-sky-100/50 dark:border-slate-800/60 rounded-2xl space-y-3 relative group transition-colors">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono shrink-0">
                          {msg.email}
                        </span>
                        {msg.isRead ? (
                          <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                            Okundu
                          </span>
                        ) : (
                          <span className="bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 animate-pulse">
                            Okunmadı
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3.5">
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          {msg.time}
                        </span>
                        <Button
                          variant="ghost"
                          className={`!px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                            msg.isRead 
                              ? "text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:hover:bg-slate-800" 
                              : "text-sky-500 border-sky-200/40 hover:bg-sky-500 hover:text-white dark:border-sky-900/40 dark:hover:bg-sky-950/20"
                          }`}
                          onClick={() => toggleMessageReadStatus(msg.id)}
                        >
                          {msg.isRead ? "Okunmadı İşaretle" : "Okundu İşaretle"}
                        </Button>
                      </div>
                    </div>

                    {/* Subject & content */}
                    <div className="space-y-1.5 font-semibold text-xs leading-relaxed">
                      <div className="text-slate-700 dark:text-sky-400 font-extrabold">
                        Konu: {msg.subject}
                      </div>
                      <p className="text-slate-500 dark:text-slate-300 bg-white/40 dark:bg-[#1C2541]/40 p-3 rounded-xl border border-sky-100/20 dark:border-slate-800/40 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {activeTab === "jobs" && (
          <Card variant="default" className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">İş İlanları Yönetim Paneli</h3>
                <p className="text-xs text-slate-400 mt-0.5">Platformda yayınlanan aktif iş ilanlarını inceleyin ve denetleyin</p>
              </div>
              
              {/* Search Bar */}
              <div className="w-full sm:max-w-xs relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="İş ilanı başlığı veya şirket ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">İş İlanı / Pozisyon</th>
                    <th className="py-3 px-2">Şirket</th>
                    <th className="py-3 px-2">Konum / Çalışma Şekli</th>
                    <th className="py-3 px-2">Deneyim / Maaş</th>
                    <th className="py-3 px-2 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">İş ilanları yükleniyor...</td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Eşleşen iş ilanı bulunamadı.</td>
                    </tr>
                  ) : (
                    filteredJobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-slate-700 dark:text-white leading-tight">
                            {j.title || j.baslik}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            Kayıt ID: {j.id}
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center space-x-2">
                            {j.companyLogoUrl && (
                              <img
                                src={getImageUrl(j.companyLogoUrl)}
                                alt=""
                                className="w-6 h-6 rounded-md object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="text-primary dark:text-sky-400 font-bold">{j.companyName || j.sirketAdi}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          <div className="text-slate-700 dark:text-slate-300 font-bold">
                            {j.location || j.konum || "Belirtilmemiş"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {j.workType || "Tümü"}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          <div className="text-slate-700 dark:text-slate-300 font-bold">
                            {j.experienceLevel || "Tümü"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {j.salaryRange || "Girilmemiş"}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <Button
                              variant="ghost"
                              className="!px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 font-bold rounded-lg"
                              onClick={() => handleDeleteJob(j.id)}
                              disabled={deletingJobId === j.id}
                            >
                              {deletingJobId === j.id ? "Siliniyor..." : "Sil"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "posts" && (
          <Card variant="default" className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Gönderi Yönetim Paneli</h3>
                <p className="text-xs text-slate-400 mt-0.5">Platformda yayınlanan akış gönderilerini denetleyin ve silin</p>
              </div>
              
              {/* Search Bar */}
              <div className="w-full sm:max-w-xs relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Gönderi içeriği veya yazar ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Posts Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Yazar</th>
                    <th className="py-3 px-2 w-[45%]">Gönderi İçeriği</th>
                    <th className="py-3 px-2">Etkileşim (Beğeni / Yorum)</th>
                    <th className="py-3 px-2">Tarih</th>
                    <th className="py-3 px-2 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Gönderiler yükleniyor...</td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Eşleşen akış gönderisi bulunamadı.</td>
                    </tr>
                  ) : (
                    filteredPosts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-slate-700 dark:text-white leading-tight">
                            {p.adSoyad || p.AdSoyad || "Bilinmeyen Kullanıcı"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {p.unvan || `@${p.userName || "kullanici"}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          <p className="line-clamp-2 leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 font-medium max-w-sm">
                            {p.content}
                          </p>
                          {p.images && p.images.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-sky-500 mt-1 bg-sky-500/10 px-1.5 py-0.5 rounded">
                              🖼️ {p.images.length} Görsel Eklendi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-bold">
                            <span className="flex items-center text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md text-[10px]">
                              ❤️ {p.likeCount ?? (p.likes || []).length}
                            </span>
                            <span className="flex items-center text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md text-[10px]">
                              💬 {p.commentCount ?? (p.comments || []).length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-400 font-mono text-[10px]">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Belirtilmemiş"}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <Button
                              variant="ghost"
                              className="!px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 font-bold rounded-lg"
                              onClick={() => handleDeletePost(p.id)}
                              disabled={deletingPostId === p.id}
                            >
                              {deletingPostId === p.id ? "Siliniyor..." : "Sil"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "users" && (
          <Card variant="default" className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Kullanıcı Yönetim Dizini</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sistemde kayıtlı profesyonel profilleri listeleyin ve denetleyin</p>
              </div>
              
              {/* Search Bar */}
              <div className="w-full sm:max-w-xs relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya isim ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-xl text-xs focus:outline-none text-slate-700 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Kullanıcı</th>
                    <th className="py-3 px-2">Unvan / Konum</th>
                    <th className="py-3 px-2">E-posta</th>
                    <th className="py-3 px-2">Rol / Yetki</th>
                    <th className="py-3 px-2 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Kullanıcı listesi detaylarıyla yükleniyor...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Eşleşen üye bulunamadı.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td 
                          className="py-3.5 px-2 flex items-center space-x-2.5 cursor-pointer hover:underline group"
                          onClick={() => navigate(`/profile/${u.id}`)}
                          title="Kullanıcı Profil Sayfasına Git"
                        >
                          <img
                            src={getImageUrl(u.profilFotografiUrl)}
                            alt=""
                            className="w-8.5 h-8.5 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-700 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-sky-400">
                              {u.adSoyad || "Anonim Üye"}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              @{u.kullaniciAdi || "kullanici"}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          <div className="max-w-[180px] truncate text-slate-700 dark:text-slate-300 font-bold">
                            {u.unvan || "Cverse Üyesi"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {u.konum || "Konum belirtilmemiş"}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-400 font-mono text-[11px]">
                          {u.email || "cverse_member@cverse.com"}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                            {u.email === "admin@cverse.com" ? "Yönetici" : "ÜYE"}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <Button
                              variant="primary"
                              className="!px-2 py-1 text-[10px] bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg shadow-sm border-none"
                              onClick={() => navigate(`/profile/${u.id}`)}
                            >
                              Profil
                            </Button>
                            {u.email !== "admin@cverse.com" && (
                              <Button
                                variant="ghost"
                                className="!px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 font-bold rounded-lg"
                                onClick={() => {
                                  if (window.confirm(`${u.adSoyad || u.kullaniciAdi} isimli kullanıcıyı veritabanından tamamen silmek istediğinize emin misiniz?`)) {
                                    handleDeleteUser(u.id);
                                  }
                                }}
                                disabled={deletingUserId === u.id}
                              >
                                {deletingUserId === u.id ? "Siliniyor..." : "Sil"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "logs" && (
          <Card variant="default" className="p-5">
            <div className="flex items-center justify-between border-b border-sky-100/50 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-sky-400">Sistem Log Analiz Paneli</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tüm uygulama loglarını, gerçek sistem çağrılarını ve bağlantı durumlarını inceleyin</p>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                SignalR Hub Aktif
              </span>
            </div>

            <div className="mt-6 bg-[#070D19] rounded-2xl p-4 font-mono text-xs text-slate-300 leading-relaxed shadow-inner max-h-[450px] overflow-y-auto space-y-3 border border-slate-900">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3.5">
                  <span className="text-slate-500 select-none">[{log.time}]</span>
                  <div className="flex-1">
                    {log.type === "success" && <span className="text-emerald-400 font-bold">[SYS/SUCCESS]</span>}
                    {log.type === "warning" && <span className="text-amber-400 font-bold">[SYS/WARNING]</span>}
                    {log.type === "info" && <span className="text-sky-400 font-bold">[SYS/INFO]</span>}
                    <span className="ml-2 text-slate-200">{log.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};

export default AdminPanel;
