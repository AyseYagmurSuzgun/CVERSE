import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getAppliedJobs();
      if (res.basarili) {
        setApplications(res.data);
      } else {
        setError(res.mesaj || "Başvurularınız yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      setError("Başvurular alınırken sistemsel bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Stats calculation
  const totalApplied = applications.length;

  const getLatestApplicationDate = () => {
    if (!applications || applications.length === 0) return "-";
    const dates = applications.map(a => new Date(a.appliedAt).getTime());
    const latestTime = Math.max(...dates);
    return new Date(latestTime).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 select-none"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Üst Başlık */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-primary border border-border-soft p-6 rounded-3xl shadow-premium text-text-primary"
        variants={slideUp}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            Başvurularım
            <span className="text-[10px] tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black border border-primary/20">
              Başvuru Takibi
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Gönderdiğiniz tüm iş başvurularını buradan takip edebilirsiniz.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/jobs")}
          className="text-xs font-black flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl shadow-md shadow-primary/20 hover:scale-102 transition-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Yeni İlanları İncele</span>
        </Button>
      </motion.div>

      {/* İstatistikler */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={slideUp}>
        {/* Toplam Başvuru */}
        <Card variant="primary" animate={false} className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider block">Toplam Başvuru</span>
            <span className="text-2xl font-black text-text-primary mt-0.5 block">{totalApplied}</span>
          </div>
        </Card>

        {/* Son Başvuru Tarihi */}
        <Card variant="secondary" animate={false} className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider block">Son Başvuru Tarihi</span>
            <span className="text-xl font-black text-text-primary mt-0.5 block">{getLatestApplicationDate()}</span>
          </div>
        </Card>
      </motion.div>

      {/* Başvuru Listesi */}
      <div className="space-y-6">
        {loading ? (
          /* Premium Shimmer Loading effect */
          [1, 2].map((n) => (
            <Card key={n} variant="primary" className="p-6 animate-pulse space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 items-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 bg-primary/10 rounded-lg w-44" />
                    <div className="h-3.5 bg-primary/10 rounded-lg w-28" />
                  </div>
                </div>
                <div className="h-6 bg-primary/10 rounded-full w-24" />
              </div>
              <div className="h-1 bg-border-soft rounded-full w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3.5 bg-primary/10 rounded-lg w-1/4" />
                <div className="h-3.5 bg-primary/10 rounded-lg w-1/5" />
              </div>
            </Card>
          ))
        ) : error ? (
          <Card variant="warning" className="p-8 text-center space-y-3">
            <span className="text-amber-600 dark:text-amber-400 text-sm font-bold block">{error}</span>
            <button 
              onClick={fetchApplications}
              className="px-5 py-2.5 bg-bg-app text-text-secondary border border-border-soft rounded-2xl text-xs font-bold shadow-sm hover:bg-primary/10 transition-colors"
            >
              Yeniden Dene
            </button>
          </Card>
        ) : applications.length === 0 ? (
          <Card variant="primary" className="p-12 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-3xl w-fit mx-auto text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-text-primary">Henüz Bir Başvurunuz Yok</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">Başvurduğunuz herhangi bir iş ilanı bulunmuyor. Kariyer hedeflerinize en uygun işleri keşfetmek ve başvuru yapmak için ilanlar sayfasına göz atabilirsiniz.</p>
            <Button
              variant="primary"
              onClick={() => navigate("/jobs")}
              className="text-xs font-bold shadow-md shadow-primary/20 px-6 py-2.5 rounded-2xl"
            >
              İş İlanlarını Keşfet
            </Button>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-4" variants={staggerContainer}>
              {applications.map((app) => {
                return (
                  <motion.div
                    key={app.id}
                    variants={slideUp}
                    className="group"
                  >
                    <Card variant="primary" className="p-5 md:p-6 transition-all duration-300">
                      {/* Üst Kısım: Firma ve Pozisyon Detayları */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <Avatar 
                            src={app.companyLogoUrl} 
                            name={app.companyName} 
                            size="lg" 
                            className="bg-bg-app p-1 border border-border-soft shrink-0" 
                          />
                          <div>
                            <h3 className="text-base font-extrabold text-text-primary tracking-tight group-hover:text-primary transition-colors">
                              {app.jobTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-primary font-bold">{app.companyName}</span>
                              <span className="text-[10px] text-text-secondary/40 font-semibold">•</span>
                              <span className="text-xs text-text-secondary font-medium">{app.location}</span>
                              <span className="text-[10px] text-text-secondary/40 font-semibold">•</span>
                              <span className="text-[10px] text-text-secondary font-semibold">Başvuru: {formatDate(app.appliedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Durum & AI Uyum Rozetleri */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {app.matchScore !== null && (
                            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
                              %{app.matchScore} AI Eşleşme
                            </span>
                          )}
                          <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            ✓ Başvuru Gönderildi
                          </span>
                        </div>
                      </div>

                      {/* Alt Kısım: Detaylar */}
                      <div className="flex justify-between items-center pt-4 mt-4 border-t border-border-soft text-[10px] text-text-secondary font-semibold">
                        <span>Çalışma Şekli: <strong className="text-text-primary">{app.workType}</strong></span>
                        <span>Seviye: <strong className="text-text-primary">{app.experienceLevel}</strong></span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default AppliedJobs;


