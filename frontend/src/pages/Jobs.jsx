import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";
import { useSignalR } from "../context/SignalRContext";

const parseMatchDetails = (details) => {
  if (!details) return { matched: [], missing: [] };
  
  let matched = [];
  let missing = [];
  
  const parts = details.split(" | ");
  parts.forEach(part => {
    if (part.startsWith("Eşleşen Yetenekler: ")) {
      const skillsStr = part.replace("Eşleşen Yetenekler: ", "");
      matched = skillsStr.split(", ").filter(s => s.trim() !== "");
    } else if (part.startsWith("Eksik Yetenekler: ")) {
      const skillsStr = part.replace("Eksik Yetenekler: ", "");
      missing = skillsStr.split(", ").filter(s => s.trim() !== "");
    }
  });
  
  return { matched, missing };
};

const Jobs = () => {
  const navigate = useNavigate();
  const { addToast } = useSignalR();

  // State Management
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Tümü");
  const [selectedWorkType, setSelectedWorkType] = useState("Tümü");
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("Tümü");
  
  // Tab State: "all" or "recommended"
  const [activeTab, setActiveTab] = useState("all");

  // Applying state
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Fetch Jobs
  useEffect(() => {
    fetchJobs();
  }, [selectedLocation, selectedWorkType, selectedExperienceLevel, activeTab]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs();
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      let fetchedJobs = [];
      
      if (activeTab === "recommended") {
        const res = await apiService.getRecommendedJobs();
        if (res.basarili) {
          fetchedJobs = res.data;
        }
      } else {
        const hasFilters = 
          searchTerm.trim() !== "" || 
          selectedLocation !== "Tümü" || 
          selectedWorkType !== "Tümü" || 
          selectedExperienceLevel !== "Tümü";

        if (hasFilters) {
          const params = {};
          if (searchTerm.trim() !== "") params.searchTerm = searchTerm;
          if (selectedLocation !== "Tümü") {
            params.location = selectedLocation === "Uzaktan" ? "Remote" : selectedLocation;
          }
          if (selectedWorkType !== "Tümü") params.workType = selectedWorkType;
          if (selectedExperienceLevel !== "Tümü") params.experienceLevel = selectedExperienceLevel;

          const res = await apiService.searchJobs(params);
          if (res.basarili) {
            fetchedJobs = res.data;
          }
        } else {
          const res = await apiService.getJobs();
          if (res.basarili) {
            fetchedJobs = res.data;
          }
        }
      }

      setJobs(fetchedJobs);
      
      // Update selected job
      if (fetchedJobs.length > 0) {
        const stillExists = fetchedJobs.find(j => selectedJob && j.id === selectedJob.id);
        setSelectedJob(stillExists ? stillExists : fetchedJobs[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
      setError("İş ilanları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!jobId) return;
    setApplyingJobId(jobId);
    try {
      const res = await apiService.applyToJob(jobId);
      if (res.basarili) {
        setJobs(prevJobs => 
          prevJobs.map(j => j.id === jobId ? { ...j, hasApplied: true } : j)
        );
        setSelectedJob(prevSelected => 
          prevSelected && prevSelected.id === jobId ? { ...prevSelected, hasApplied: true } : prevSelected
        );
        if (addToast) addToast("Başvurunuz başarıyla iletildi!", "success");
      } else {
        if (addToast) addToast(res.mesaj || "Başvuru yapılamadı.", "error");
      }
    } catch (err) {
      console.error(err);
      if (addToast) addToast(err.mesaj || "Başvuru sırasında sistemsel bir hata oluştu.", "error");
    } finally {
      setApplyingJobId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "Bugün";
    if (diffDays === 2) return "Dün";
    return `${diffDays} gün önce`;
  };

  const { matched: selectedMatched, missing: selectedMissing } = parseMatchDetails(selectedJob?.matchDetails);

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6 select-none"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Üst Kısım: Başlık & AI Matching Tab Toggle */}
      <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border-soft p-6 rounded-3xl shadow-sm" variants={slideUp}>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
            CVerse Jobs 
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Yapay zeka CV analiziyle entegre, size en uygun iş ilanlarını keşfedin.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-bg-app p-1.5 rounded-2xl border border-border-soft shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "all"
                ? "bg-card text-text-primary shadow-md border border-border-soft"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tüm İlanlar
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "recommended"
                ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md shadow-primary/20"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Bana Özel AI Önerilenler
          </button>
        </div>
      </motion.div>

      {/* Arama ve Gelişmiş Filtreleme Paneli */}
      {activeTab === "all" && (
        <motion.div className="bg-card border border-border-soft p-5 rounded-3xl shadow-sm space-y-4" variants={slideUp}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Arama Barı */}
            <div className="lg:col-span-4 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pozisyon, yetenek veya şirket ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-app border border-border-soft rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder-text-secondary font-bold"
              />
            </div>

            {/* Konum Filtresi */}
            <div className="lg:col-span-3">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider shrink-0 px-1">Konum:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary transition-all"
                >
                  <option value="Tümü">Tüm Konumlar</option>
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Remote">Uzaktan (Remote)</option>
                </select>
              </div>
            </div>

            {/* Çalışma Tipi Filtresi */}
            <div className="lg:col-span-2.5">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider shrink-0 px-1">Çalışma:</span>
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary transition-all"
                >
                  <option value="Tümü">Tüm Tipler</option>
                  <option value="Remote">Uzaktan (Remote)</option>
                  <option value="Hybrid">Hibrit (Hybrid)</option>
                  <option value="On-Site">Yerinde (On-Site)</option>
                </select>
              </div>
            </div>

            {/* Deneyim Filtresi */}
            <div className="lg:col-span-2.5">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider shrink-0 px-1">Seviye:</span>
                <select
                  value={selectedExperienceLevel}
                  onChange={(e) => setSelectedExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-app border border-border-soft rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary transition-all"
                >
                  <option value="Tümü">Tüm Seviyeler</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ana Gösterge Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL BÖLME: İş İlanları Listesi */}
        <motion.div className="col-span-1 lg:col-span-5 space-y-4 max-h-[72vh] overflow-y-auto pr-2 scrollbar-thin" variants={slideUp}>
          {loading ? (
            /* Premium Yükleniyor Shimmer Fallback */
            [1, 2, 3].map((n) => (
              <Card key={n} variant="default" className="p-5 animate-pulse">
                <div className="flex space-x-4 items-center">
                  <div className="w-12 h-12 bg-border-soft rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3.5 bg-border-soft rounded-lg w-3/4" />
                    <div className="h-3 bg-border-soft rounded-lg w-1/2" />
                    <div className="flex justify-between mt-2 pt-2">
                      <div className="h-2.5 bg-border-soft rounded-lg w-1/4" />
                      <div className="h-2.5 bg-border-soft rounded-lg w-1/5" />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : error ? (
            <Card variant="warning" className="p-6 text-center space-y-3">
              <span className="text-rose-500 text-sm font-bold block">{error}</span>
              <button 
                onClick={fetchJobs}
                className="px-4 py-2 bg-card text-text-primary border border-border-soft rounded-xl text-xs font-bold shadow-sm hover:bg-card-primary transition-colors"
              >
                Yeniden Dene
              </button>
            </Card>
          ) : jobs.length === 0 ? (
            <Card variant="default" className="p-8 text-center space-y-3">
              <div className="p-3 bg-card-primary text-text-secondary rounded-2xl w-fit mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-text-primary">İlan Bulunamadı</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">Aradığınız kriterlere uygun açık pozisyon bulunmuyor. Lütfen filtrelerinizi sıfırlamayı veya farklı terimlerle aramayı deneyin.</p>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {jobs.map((job) => {
                const { matched, missing } = parseMatchDetails(job.matchDetails);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedJob(job)}
                  >
                    <Card
                      variant={selectedJob?.id === job.id ? "primary" : "default"}
                      className={`p-5 cursor-pointer border transition-all ${
                        selectedJob?.id === job.id
                          ? "border-primary shadow-md"
                          : "hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      <div className="flex space-x-4.5 items-start">
                        <Avatar src={job.companyLogoUrl} name={job.companyName} size="lg" className="bg-card border border-border-soft p-1 shrink-0 animate-float" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-extrabold text-text-primary truncate w-32 md:w-44">
                              {job.title}
                            </h4>
                            {/* AI Match Score Badge */}
                            {job.matchScore !== null ? (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                                job.matchScore >= 80
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                                  : job.matchScore >= 50
                                  ? "bg-primary/15 text-primary border border-primary/20"
                                  : "bg-border-soft text-text-secondary border border-border-soft"
                              }`}>
                                %{job.matchScore} AI Uyum
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/20 shrink-0">
                                Skor Yok
                              </span>
                            )}
                          </div>
                          
                          <span className="text-xs text-primary font-bold block mt-1">{job.companyName}</span>
                          <p className="text-xs text-text-secondary font-semibold mt-1">{job.location}</p>

                          {/* AI Match Badges inside Listing */}
                          {job.matchScore !== null && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {matched.slice(0, 2).map((skill, idx) => (
                                <span key={`matched-${idx}`} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-0.5">
                                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {skill}
                                </span>
                              ))}
                              {missing.slice(0, 2).map((skill, idx) => (
                                <span key={`missing-${idx}`} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-0.5">
                                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  {skill}
                                </span>
                              ))}
                              {(matched.length > 2 || missing.length > 2) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-border-soft">
                                  +{matched.length + missing.length - Math.min(2, matched.length) - Math.min(2, missing.length)}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-2">
                              <span className="text-[10px] text-text-secondary font-extrabold bg-card-primary/80 px-2 py-1 rounded-md">
                                {job.workType}
                              </span>
                              <span className="text-[10px] text-text-secondary font-extrabold bg-card-primary/80 px-2 py-1 rounded-md">
                                {job.experienceLevel}
                              </span>
                            </div>
                            <span className="text-[10px] text-text-secondary font-semibold">
                              {formatDate(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>

        {/* SAĞ BÖLME: İş İlanı Detayı */}
        <motion.div className="col-span-1 lg:col-span-7" variants={slideUp}>
          {selectedJob ? (
            <Card variant="default" className="p-6 md:p-8 min-h-[55vh]">
              {/* Detay Üst Başlık */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-soft gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar src={selectedJob.companyLogoUrl} name={selectedJob.companyName} size="xl" className="bg-card border border-border-soft p-1" />
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-text-primary tracking-tight">{selectedJob.title}</h2>
                    <span className="text-sm text-primary font-extrabold block mt-0.5">{selectedJob.companyName}</span>
                    <p className="text-xs text-text-secondary font-semibold mt-1">{selectedJob.location}</p>
                  </div>
                </div>

                {/* Yapay Zeka Uyum Skoru (Sağ Taraf) */}
                {selectedJob.matchScore !== null && (
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-text-secondary">Yapay Zeka Uyumu:</span>
                      <span className={`text-sm font-black ${
                        selectedJob.matchScore >= 80 ? "text-emerald-500" : "text-primary"
                      }`}>
                        %{selectedJob.matchScore}
                      </span>
                    </div>
                    <div className="w-32 h-1.5 bg-border-soft rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        className={`h-full ${
                          selectedJob.matchScore >= 80 ? "bg-emerald-500" : "bg-primary"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedJob.matchScore}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* AI MATCH SCORE WARNING BANNER */}
              {selectedJob.matchScore === null && (
                <div className="mt-4 p-4 bg-card-warning/60 backdrop-blur-md border border-border-soft rounded-2xl text-xs font-semibold text-text-primary flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-extrabold text-text-primary">AI Eşleşme Skoru Yok</p>
                      <p className="text-text-secondary mt-0.5 font-semibold">Bu iş ilanı için yapay zeka uyum puanını ve eşleşen yeteneklerinizi görmek için bir CV yüklemelisiniz.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/cv-analysis")}
                    className="px-4.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 transition-all shrink-0 active:scale-95 text-xs whitespace-nowrap"
                  >
                    CV Analizine Git
                  </button>
                </div>
              )}

              {/* AI Match Grid */}
              {selectedJob.matchScore !== null && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">AI Uyum Değerlendirmesi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Eşleşen Yetenekler */}
                    <div className="bg-card-success/60 border border-emerald-500/20 p-5 rounded-2xl">
                      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-emerald-500/10">
                        <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-emerald-500">Eşleşen Yetenekler</h4>
                          <p className="text-[10px] text-text-secondary font-semibold">Özgeçmişinizle eşleşen aranan yetenekler</p>
                        </div>
                      </div>
                      
                      {selectedMatched.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMatched.map((skill, idx) => (
                            <span key={`matched-detail-${idx}`} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 rounded-xl text-[10px] font-extrabold transition-all hover:scale-105">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-text-secondary font-semibold italic">Uyumlu yetenek bulunamadı veya belirtilmemiş.</p>
                      )}
                    </div>

                    {/* Eksik Yetenekler */}
                    <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
                      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-rose-500/10">
                        <div className="p-1.5 bg-rose-500/10 rounded-xl text-rose-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-rose-500">Geliştirilmesi Gerekenler</h4>
                          <p className="text-[10px] text-text-secondary font-semibold">İlan için istenen eksik yetenekleriniz</p>
                        </div>
                      </div>
                      
                      {selectedMissing.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMissing.map((skill, idx) => (
                            <span key={`missing-detail-${idx}`} className="px-2.5 py-1 bg-rose-500/15 text-rose-500 border border-rose-500/25 rounded-xl text-[10px] font-extrabold transition-all hover:scale-105">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-text-secondary font-semibold italic">Tüm yetenekler eşleşiyor veya eksik yetenek yok!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* İş Tanımı ve Gereksinimler */}
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">İş Tanımı</h3>
                  <p className="text-text-secondary text-sm font-medium leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Gerekli Yetenekler (Required Skills Badges) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Aranan Teknolojik Yetenekler</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 ? (
                      selectedJob.requiredSkills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-3.5 py-1.5 bg-card-primary hover:bg-card-secondary text-text-primary border border-border-soft rounded-xl text-xs font-black transition-colors"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-semibold text-text-secondary italic">Özel bir yetenek kriteri girilmemiş.</span>
                    )}
                  </div>
                </div>

                {/* Maaş & Tip Detayları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-border-soft p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider block">Maaş Skalası</span>
                    <span className="text-xs font-black text-text-primary mt-1 block">
                      {selectedJob.salaryRange || "Belirtilmemiş"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider block">Çalışma Tipi</span>
                    <span className="text-xs font-black text-text-primary mt-1 block">{selectedJob.workType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider block">Deneyim Seviyesi</span>
                    <span className="text-xs font-black text-text-primary mt-1 block">{selectedJob.experienceLevel}</span>
                  </div>
                </div>
              </div>

              {/* Başvur Butonu / Başvuruldu Durumu */}
              <div className="pt-6 border-t border-border-soft flex justify-end">
                <AnimatePresence mode="wait">
                  {selectedJob.hasApplied ? (
                    <motion.div
                      key="applied"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        variant="success"
                        className="px-8 py-3 rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 pointer-events-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Başvuruldu</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="apply"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        variant="primary"
                        onClick={() => handleApply(selectedJob.id)}
                        disabled={applyingJobId === selectedJob.id}
                        className="px-8 py-3 rounded-2xl text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1.5"
                      >
                        {applyingJobId === selectedJob.id ? (
                           <>
                             <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                             <span>İşleniyor...</span>
                           </>
                        ) : (
                          <span>Hemen Başvur</span>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          ) : (
            <Card variant="default" className="p-12 text-center text-text-secondary">
              Detayları görüntülemek için sol listeden bir iş ilanı seçin.
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Jobs;

