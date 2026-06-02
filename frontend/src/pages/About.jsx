import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const About = () => {
  const [activeTab, setActiveTab] = useState("structure");

  const platformStructure = [
    {
      title: "1. Ana Akış (Sosyal Medya)",
      desc: "Bilişim uzmanlarının ve yazılımcıların teknik düşüncelerini paylaştığı, görsel içerik ve makaleler yayınlayabildiği, gönderileri beğenip yorum yazarak etkileşime geçtiği merkezi paylaşım alanı.",
      icon: (
        <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      title: "2. Keşfet & Arama Dizini",
      desc: "Platformdaki diğer tüm profesyonelleri unvan ve biyografileriyle listeleyen, detaylı yetenek ve kişi araması yapabileceğiniz ve diğer kullanıcıların public profillerini inceleyebileceğiniz alan.",
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "3. Yapay Zeka Destekli ATS Analizi",
      desc: "Özgeçmiş dosyanızı (PDF formatında) yükleyerek yapay zeka motorumuz tarafından taranmasını sağlayın. CV'nizin ATS uyumluluğunu, güçlü yanlarını, eksik yeteneklerinizi ve eşleşme skorunu anında görün.",
      icon: (
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "4. Gerçek Zamanlı Mesajlaşma (SignalR)",
      desc: "İlgilendiğiniz veya ortak projeler yürütmek istediğiniz diğer geliştiricilerle SignalR WebSocket altyapısı sayesinde tamamen anlık ve kesintisiz şekilde birebir sohbet edin.",
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "5. Eğitici Geliştirici Oyunları",
      desc: "Yazılımcıların zihinsel odaklanmalarını artırmak için tasarlanmış kategori tabanlı Kelime Bulmaca ve yapay zekaya karşı yarışabileceğiniz gelişmiş XOX oyun modülleri.",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    }
  ];

  const usageSteps = [
    {
      step: "Adım 1: Profilinizi Özelleştirin",
      desc: "Hesabınızı oluşturduktan sonra ilk olarak Profilim sayfasına gidin. Buradan kapak fotoğrafınızı ve profil resminizi güncelleyin; ardından eğitim, deneyim, sertifika ve teknik yeteneklerinizi ekleyerek işverenlerin dikkatini çekecek profesyonel kimliğinizi oluşturun."
    },
    {
      step: "Adım 2: İş Ağı Kurun ve Etkileşime Geçin",
      desc: "Keşfet sekmesini kullanarak diğer yazılımcıları inceleyin, onları takip edin. Ana Akış sayfasında mesleki paylaşımlar yapın, diğerlerinin gönderilerini beğenin veya yorum yazarak sektör içi tartışmalara katılın."
    },
    {
      step: "Adım 3: CV Analizinizi Yapın",
      desc: "ATS & CV Analizi sayfasına girerek özgeçmişinizi sisteme yükleyin. Dakikalar içerisinde yapay zeka analiz raporunuzu alın, eksik görülen kısımları iyileştirerek gerçek iş ilanlarında şansınızı katlayın."
    },
    {
      step: "Adım 4: İş İlanlarını Değerlendirin",
      desc: "İş İlanları sekmesinden niteliklerinize uygun ilanları aratın ve tek tıkla başvuru yapın. Başvurularım sekmesi üzerinden süreci anlık olarak takip edin ve İK uzmanlarıyla anında mesajlaşmaya başlayın."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E1F0FA] via-[#B9DCF4] to-[#E1F0FA] py-8 px-4 sm:px-8 flex flex-col items-center select-none overflow-y-auto">
      {/* Floating Header */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-sky-100/40 dark:border-slate-800/40 shadow-sm mb-8 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-sky-100 dark:border-slate-800 shrink-0">
            <img src="/weblogo.png" alt="Cverse Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <span className="text-base font-extrabold tracking-wider text-slate-800 dark:text-white">CVERSE</span>
        </div>
        <Link to="/login">
          <Button variant="primary" className="text-xs font-bold bg-primary hover:bg-primary/95 text-white py-2.5 px-6 !rounded-xl shadow-md shadow-primary/10">
            Giriş Yap
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-5xl space-y-10 relative z-10">

        {/* Navigation tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("structure")}
              className={`p-4 rounded-2xl border text-left font-bold transition-all shadow-sm flex items-center justify-between ${
                activeTab === "structure"
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.01]"
                  : "bg-white/80 border-blue-200/40 text-slate-600 hover:bg-white dark:bg-[#1C2541] dark:border-[#3A506B]/45 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>Uygulama Genel Yapısı</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => setActiveTab("usage")}
              className={`p-4 rounded-2xl border text-left font-bold transition-all shadow-sm flex items-center justify-between ${
                activeTab === "usage"
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.01]"
                  : "bg-white/80 border-blue-200/40 text-slate-600 hover:bg-white dark:bg-[#1C2541] dark:border-[#3A506B]/45 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>Platform Nasıl Kullanılır?</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Tab content pane */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "structure" ? (
                  <Card variant="default" className="p-6 sm:p-8 space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500">CVERSE MODÜLLERİ</span>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1">Platformun Genel Mimarisi</h2>
                    </div>
                    
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      CVERSE, profesyonellerin kariyer gelişimini hedeflerken sosyal iletişim kurabilecekleri 5 temel katmandan oluşmaktadır:
                    </p>

                    <div className="space-y-5.5 border-t border-sky-100/50 dark:border-slate-800/40 pt-4">
                      {platformStructure.map((mod, index) => (
                        <div key={index} className="flex items-start space-x-3 text-xs leading-normal font-semibold">
                          <span className="mt-0.5 p-2.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
                            {mod.icon}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{mod.title}</h4>
                            <p className="text-slate-400 dark:text-slate-400 mt-1">{mod.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card variant="default" className="p-6 sm:p-8 space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500">ADIM ADIM YOL HARİTASI</span>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1">CVERSE Başlangıç Rehberi</h2>
                    </div>

                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Uygulamayı en verimli şekilde kullanmak ve kariyerinizde öne çıkmak için bu 4 adımlı kılavuzu takip edebilirsiniz:
                    </p>

                    <div className="space-y-6 border-t border-sky-100/50 dark:border-slate-800/40 pt-4">
                      {usageSteps.map((step, index) => (
                        <div key={index} className="relative pl-5 font-semibold text-xs leading-normal">
                          {/* Dot indicator */}
                          <span className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white dark:border-slate-900 shadow-sm" />
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">{step.step}</h4>
                          <p className="text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
