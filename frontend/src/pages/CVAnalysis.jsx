import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { apiService } from "../services/api";
import { useSignalR } from "../context/SignalRContext";

const CVAnalysis = () => {
  const { addToast } = useSignalR() || {};
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await apiService.getMyCvAnalyses();
      if (res.basarili) setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Bu analiz geçmişini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await apiService.deleteCvAnalysis(id);
      if (res.basarili) {
        setHistory(h => h.filter(item => item.id !== id));
        if (result && result.id === id) {
          setResult(null);
        }
        if (addToast) addToast("Analiz geçmişi başarıyla silindi.", "success");
      } else {
        if (addToast) addToast(res.mesaj || "Analiz silinemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      if (addToast) addToast("Silme işlemi sırasında bir hata oluştu.", "error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    processFile(droppedFiles);
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    processFile(selectedFiles);
  };

  const processFile = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    
    // 👈 FileList içerisinden ilk fiziksel dosyayı çekiyoruz
    const selectedFile = fileList[0]; 
 
    // 👈 Tarayıcı veya işletim sistemi uyumsuzluklarını önleyen esnek kontrol yapısı
    const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf') || 
                  selectedFile.type === 'application/pdf' || 
                  selectedFile.type === 'application/x-pdf';

    if (!isPdf) {
      if (addToast) addToast("Lütfen sadece PDF formatında bir dosya yükleyin.", "warning");
      return;
    }

    setFile(selectedFile);
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      // Fake progress animation while uploading/analyzing
      const progressInterval = setInterval(() => {
        setProgress(p => (p >= 90 ? 90 : p + 5));
      }, 500);

      const res = await apiService.uploadCv(selectedFile, (e) => {
        // Optional actual upload progress
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        if (res.basarili && res.data) {
          setResult(res.data);
          loadHistory(); // Update history list
          if (addToast) addToast("Özgeçmişiniz başarıyla analiz edildi!", "success");
        } else {
          if (addToast) addToast(res.mesaj || "Analiz sırasında bir hata oluştu.", "error");
          setFile(null);
        }
        setIsAnalyzing(false);
      }, 500);
      
    } catch (err) {
      console.error(err);
      if (addToast) addToast(err.mesaj || "Beklenmedik bir hata oluştu. CV PDF'iniz okunamamış olabilir.", "error");
      setIsAnalyzing(false);
      setFile(null);
    }
  };

  const getChartData = () => {
    if (!result) return [];
    return [
      { subject: 'Teknik', A: result.scoreTechnical || 0, fullMark: 100 },
      { subject: 'Deneyim', A: result.scoreExperience || 0, fullMark: 100 },
      { subject: 'Format', A: result.scoreFormatting || 0, fullMark: 100 },
      { subject: 'Etki', A: result.scoreImpact || 0, fullMark: 100 }
    ];
  };

  const getBarChartData = () => {
    if (!result) return [];
    return [
      { subject: 'Teknik', 'Skorunuz': result.scoreTechnical || 0, 'Sektör Hedefi': 85 },
      { subject: 'Deneyim', 'Skorunuz': result.scoreExperience || 0, 'Sektör Hedefi': 80 },
      { subject: 'Format', 'Skorunuz': result.scoreFormatting || 0, 'Sektör Hedefi': 90 },
      { subject: 'Etki', 'Skorunuz': result.scoreImpact || 0, 'Sektör Hedefi': 85 }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Header */}
      {result && !isAnalyzing ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border-soft gap-4"
        >
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <span>Özgeçmiş Analiz Raporu</span>
              <span>/</span>
              <span className="text-text-secondary">{result.experienceLevel} Seviye</span>
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight mt-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate max-w-[250px] md:max-w-md" title={result.originalFileName}>{result.originalFileName}</span>
            </h1>
            <p className="text-[10px] text-text-secondary font-semibold mt-0.5">
              Analiz Tarihi: {new Date(result.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setResult(null)} 
              className="text-xs font-black flex items-center space-x-1.5 px-4 py-2 rounded-full border-border-soft hover:bg-primary/10 transition-colors"
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Yeni CV Analiz Et</span>
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">AI ATS Özgeçmiş Analizi</h1>
          <p className="text-sm text-text-secondary font-semibold max-w-xl mx-auto">
            Özgeçmişinizi saniyeler içinde analiz edin. Yapay zeka destekli altyapımızla ATS uyumluluğunuzu ölçün, eksiklerinizi görün ve kariyerinizi bir adım öne taşıyın.
          </p>
        </div>
      )}

      {/* Upload Zone */}
      {!isAnalyzing && !result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <Card 
            variant="primary"
            className={`p-12 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-primary bg-primary/10' : 'border-border-soft hover:border-primary/50 hover:bg-card-secondary'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">PDF Özgeçmişinizi Bırakın</h3>
            <p className="text-xs text-text-secondary font-semibold mb-6">veya bilgisayarınızdan seçmek için tıklayın (Max 5MB)</p>
            <Button variant="primary" className="px-8 rounded-full shadow-md pointer-events-none">CV Seç</Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
          </Card>

          {/* Past Analyses / History Panel */}
          {history && history.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 border-b border-border-soft pb-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">Geçmiş Analizleriniz</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{history.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    variant="primary"
                    onClick={() => setResult(item)}
                    className="group relative flex flex-col justify-between p-5 hover:border-primary/40 rounded-2xl cursor-pointer select-none overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start space-x-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform duration-300 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-text-primary truncate" title={item.originalFileName}>
                              {item.originalFileName}
                            </h4>
                            <p className="text-[9px] text-text-secondary font-semibold mt-0.5">
                              {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-xs shadow-sm shrink-0 bg-gradient-to-br ${
                          item.atsScore >= 80 ? 'from-emerald-400 to-emerald-600' :
                          item.atsScore >= 60 ? 'from-amber-400 to-amber-600' :
                          'from-rose-400 to-rose-600'
                        }`}>
                          {item.atsScore}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-md">
                          {item.experienceLevel}
                        </span>
                        {item.technicalSkills && item.technicalSkills.slice(0, 2).map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-secondary/15 text-primary text-[9px] font-bold rounded-md truncate max-w-[80px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors duration-200"
                        title="Geçmişten Sil"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Analyzing Loader */}
      {isAnalyzing && (
        <Card variant="primary" className="p-16 flex flex-col items-center justify-center shadow-premium">
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full text-border-soft" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
            </svg>
            <svg className="absolute inset-0 w-full h-full text-primary -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${progress * 2.82}, 282`} className="transition-all duration-300" />
            </svg>
            <span className="text-xl font-black text-text-primary">%{progress}</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary animate-pulse">Yapay Zeka Özgeçmişinizi Analiz Ediyor...</h3>
          <p className="text-xs text-text-secondary font-semibold mt-2">ATS optimizasyonu ölçülüyor, yetenekler taranıyor.</p>
        </Card>
      )}

      {/* Results Dashboard */}
      {result && !isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* ÜST ALAN: 4-Column Header Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. ATS Score Card */}
            <Card variant="primary" className="p-5 bg-gradient-to-br from-primary to-indigo-600 dark:from-primary-dark dark:to-indigo-950 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-36">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6 animate-pulse" />
              <div>
                <h3 className="text-[10px] font-black opacity-80 uppercase tracking-widest">ATS Skoru</h3>
                <div className="text-4xl font-black mt-1 flex items-baseline tracking-tight">
                  {result.atsScore}
                  <span className="text-sm font-bold opacity-60 ml-1">/100</span>
                </div>
              </div>
              <div className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md w-fit">
                {result.atsScore >= 80 ? 'Mükemmel Uyum' :
                 result.atsScore >= 60 ? 'Başarılı Profil' : 'Geliştirilmeli'}
              </div>
            </Card>

            {/* 2. Experience Level Card */}
            <Card variant="primary" className="p-5 flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-6 -mt-6 shrink-0" />
              <div>
                <h3 className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Deneyim Seviyesi
                </h3>
                <div className="text-xl font-black text-text-primary mt-2.5 capitalize">{result.experienceLevel}</div>
              </div>
              <p className="text-[9px] text-text-secondary font-semibold leading-normal">Kariyer basamaklarında {result.experienceLevel === 'senior' ? 'ileri düzey' : result.experienceLevel === 'mid' ? 'orta düzey' : 'başlangıç düzeyi'} profesyonel.</p>
            </Card>

            {/* 3. Upload Summary Card */}
            <Card variant="secondary" className="p-5 flex flex-col justify-between h-36 relative overflow-hidden">
              <div>
                <h3 className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Dosya Bilgisi
                </h3>
                <div className="text-[11px] font-black text-text-primary mt-3.5 truncate max-w-[170px]" title={result.originalFileName}>
                  {result.originalFileName}
                </div>
              </div>
              <div className="text-[9px] text-text-secondary font-semibold">
                Tür: PDF | Tarih: {new Date(result.createdAt).toLocaleDateString("tr-TR")}
              </div>
            </Card>

            {/* 4. Overall Match Score Card */}
            <Card variant="warning" className="p-5 flex flex-col justify-between h-36 relative overflow-hidden">
              <div>
                <h3 className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Pazar Potansiyeli
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-2xl font-black text-text-primary">
                    %{Math.round((result.scoreTechnical * 0.4) + (result.scoreExperience * 0.4) + (result.scoreImpact * 0.2))}
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Aktif</span>
                </div>
              </div>
              <div className="w-full bg-border-soft h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((result.scoreTechnical * 0.4) + (result.scoreExperience * 0.4) + (result.scoreImpact * 0.2))}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </Card>

          </div>

          {/* ORTA ALAN: Charts & Progress Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Radar (Metrik Dağılımı) */}
            <Card variant="primary" className="lg:col-span-4 p-4 min-h-[250px] flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Metrik Dağılımı
              </h4>
              <div className="w-full h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getChartData()}>
                    <PolarGrid stroke="var(--border-soft)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Skor" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Column 2: Bar (Sektör Karşılaştırması) */}
            <Card variant="secondary" className="lg:col-span-4 p-4 min-h-[250px] flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-light" />
                Sektör Karşılaştırması
              </h4>
              <div className="w-full h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getBarChartData()} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                    <XAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 700 }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }} 
                    />
                    <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', fill: 'var(--text-secondary)' }} />
                    <Bar dataKey="Skorunuz" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Skorunuz" />
                    <Bar dataKey="Sektör Hedefi" fill="var(--color-text-secondary)" opacity={0.3} radius={[4, 4, 0, 0]} name="Sektör Hedefi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Column 3: ATS Progress Bars (ATS Metrik Detayları) */}
            <Card variant="default" className="lg:col-span-4 p-4 min-h-[250px] flex flex-col justify-between">
              <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ATS Metrik Detayları
              </h4>
              <div className="flex-1 flex flex-col justify-center space-y-3.5">
                {[
                  { label: "Teknik Yetenek", val: result.scoreTechnical, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "İş/Deneyim Uyumu", val: result.scoreExperience, color: "from-blue-400 to-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { label: "Format ve Şablon", val: result.scoreFormatting, color: "from-indigo-400 to-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                  { label: "CV Dil Etkisi", val: result.scoreImpact, color: "from-violet-400 to-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/20" }
                ].map((bar, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-text-primary">
                      <span>{bar.label}</span>
                      <span className="font-black">%{bar.val}</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-app border border-border-soft rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${bar.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.val}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* ALT ALAN: Grafiklerin Altında Geniş, Premium Analiz Kartları Grid'i */}
          <div className="space-y-6 mt-6">
            
            {/* 3-Column Categorized Spacious Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Teknik Yetenekler */}
              <Card variant="success" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Teknik Yetenekler</h4>
                </div>
                <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {result.technicalSkills && result.technicalSkills.length > 0 ? (
                    result.technicalSkills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20 text-xs font-bold rounded-xl border border-emerald-500/20 transition-transform hover:scale-105">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">CV içerisinde teknik yetenek tespit edilemedi.</span>
                  )}
                </div>
              </Card>

              {/* Eksik Yetenekler */}
              <Card variant="warning" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Eksik Teknolojiler</h4>
                </div>
                <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 dark:bg-rose-500/20 text-xs font-bold rounded-xl border border-rose-500/20 transition-transform hover:scale-105">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">Harika! Hedef pozisyon için eksik yetenek bulunamadı.</span>
                  )}
                </div>
              </Card>

              {/* Güçlü Yönler */}
              <Card variant="primary" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Güçlü Yönler</h4>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary font-semibold list-none pl-0 overflow-y-auto custom-scrollbar flex-1 pr-1 text-left">
                  {result.strengths && result.strengths.length > 0 ? (
                    result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">Belirtilmemiş.</span>
                  )}
                </ul>
              </Card>

              {/* Zayıf Yönler / Gelişim Alanları */}
              <Card variant="warning" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Gelişim Alanları</h4>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary font-semibold list-none pl-0 overflow-y-auto custom-scrollbar flex-1 pr-1 text-left">
                  {result.weaknesses && result.weaknesses.length > 0 ? (
                    result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{w}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">Belirtilmemiş.</span>
                  )}
                </ul>
              </Card>

              {/* AI Pozisyon Önerileri */}
              <Card variant="secondary" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-violet-500/10 text-violet-600 rounded-2xl border border-violet-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.813L21 9.813l-4.813-9L9.813 15.904z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21L3 15" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">AI Pozisyon Önerileri</h4>
                </div>
                <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {result.jobSuggestions && result.jobSuggestions.length > 0 ? (
                    result.jobSuggestions.map((j, i) => (
                      <span key={i} className="px-2.5 py-1 bg-violet-500/10 text-violet-700 dark:text-violet-300 dark:bg-violet-500/20 text-xs font-bold rounded-xl border border-violet-500/20 transition-transform hover:scale-105">
                        {j}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">Öneri bulunmuyor.</span>
                  )}
                </div>
              </Card>

              {/* CV Geliştirme Tavsiyeleri */}
              <Card variant="default" className="p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-start min-h-[220px]">
                <div className="flex items-center space-x-3 mb-4 shrink-0">
                  <div className="p-2 bg-teal-500/10 text-teal-600 rounded-2xl border border-teal-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">CV Geliştirme Tavsiyeleri</h4>
                </div>
                <ul className="space-y-2 text-xs text-text-secondary font-semibold list-none pl-0 overflow-y-auto custom-scrollbar flex-1 pr-1 text-left">
                  {result.improvementSuggestions && result.improvementSuggestions.length > 0 ? (
                    result.improvementSuggestions.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{imp}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary italic">Öneri bulunmuyor.</span>
                  )}
                </ul>
              </Card>

            </div>

            {/* Geniş Geçmiş Analizler Bölümü */}
            <div className="w-full">
              {history && history.filter(item => item.id !== result.id).length > 0 ? (
                <Card variant="default" className="p-6 flex flex-col justify-start">
                  <div className="flex items-center justify-between border-b border-border-soft pb-3 mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Önceki Analizleriniz</h4>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-black px-2.5 py-1 rounded-full shrink-0 border border-primary/20">
                      {history.filter(item => item.id !== result.id).length} Kayıt
                    </span>
                  </div>
                  <div className="flex flex-row overflow-x-auto gap-4 py-2 custom-scrollbar flex-1 items-center select-none w-full">
                    {history.filter(item => item.id !== result.id).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setResult(item)}
                        className="group flex flex-col justify-between p-4 bg-card border border-border-soft hover:bg-card-primary hover:border-primary/50 rounded-2xl transition-all duration-200 cursor-pointer select-none min-w-[200px] max-w-[200px] h-[95px] shrink-0 hover:shadow-sm"
                      >
                        <div className="truncate text-left min-w-0">
                          <h5 className="text-xs font-black text-text-primary truncate w-full" title={item.originalFileName}>
                            {item.originalFileName}
                          </h5>
                          <p className="text-[9px] text-text-secondary font-bold mt-1">
                            {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-soft">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                            item.atsScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                            item.atsScore >= 60 ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            ATS Skoru: %{item.atsScore}
                          </span>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1 text-text-secondary hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all duration-200 shrink-0"
                            title="Geçmişten Sil"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card variant="default" className="p-6 border border-dashed border-border-soft shadow-sm flex items-center justify-center min-h-[100px] text-center text-xs text-text-secondary font-semibold rounded-2xl">
                  Geçmiş analiz bulunmuyor.
                </Card>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CVAnalysis;
