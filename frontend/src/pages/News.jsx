import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { staggerContainer, slideUp } from "../animations";
import { useSignalR } from "../context/SignalRContext";

const News = () => {
  const { addToast } = useSignalR();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // High-quality simulated technology news dataset for offline fallback
  const getSimulatedNews = () => [
    {
      id: 1,
      title: "GPT-5 ve AGI Aşamaları: Yapay Zeka Ajanları Sektörleri Nasıl Değiştirecek?",
      category: "ai",
      summary: "Yeni nesil yapay zeka modelleri sadece soru cevaplamakla kalmıyor, artık karmaşık hedefleri otonom olarak gerçekleştirebilen tam teşekküllü ajanlara dönüşüyor.",
      source: "AI Frontiers",
      time: "4 dk okuma",
      date: "Bugün",
      image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60",
      featured: true,
      link: "https://techcrunch.com"
    },
    {
      id: 2,
      title: ".NET 10 Preview 1 Yayınlandı: AOT Derleme ve Bulut Entegrasyonlarında Devrim",
      category: "dev",
      summary: "Microsoft, yeni derleyici optimizasyonları ve minimal konteyner boyutları sunan .NET 10 önizleme sürümünü geliştiricilerin testine sundu.",
      source: "DevTech Portal",
      time: "6 dk okuma",
      date: "Bugün",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
      featured: true,
      link: "https://techcrunch.com"
    },
    {
      id: 3,
      title: "WebAssembly (Wasm) Sunucu Tarafında Yükselişte: Konteynerlerin Sonu mu?",
      category: "dev",
      summary: "Sıfır milisaniye soğuk başlatma süreleri ve ultra hafif bellek ayak izleriyle Wasm, edge computing dünyasında Docker'a güçlü bir alternatif haline geliyor.",
      source: "Cloud Native Digest",
      time: "5 dk okuma",
      date: "Dün",
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=60",
      featured: true,
      link: "https://techcrunch.com"
    },
    {
      id: 4,
      title: "CVerse, Yerli Girişim Ekosisteminde Yılın En İnovatif SaaS Platformu Adayı",
      category: "startup",
      summary: "Yapay zeka tabanlı CV analizi ve akıllı iş eşleştirme motoruyla CVerse, yetenek kazanımı pazarında dengeleri değiştiren yenilikçi bir MVP olarak dikkat çekiyor.",
      source: "Startup Daily",
      time: "3 dk okuma",
      date: "2 gün önce",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60",
      featured: false,
      link: "https://techcrunch.com"
    },
    {
      id: 5,
      title: "Rust Dilinin Kurumsal Sistemlerde Kullanımı Yüzde 40 Artış Gösterdi",
      category: "dev",
      summary: "Güvenli bellek yönetimi ve yüksek performansı sayesinde Amazon, Google ve Microsoft gibi teknoloji devleri kritik altyapılarını Rust diline taşımaya hız verdi.",
      source: "Systems Journal",
      time: "8 dk okuma",
      date: "3 gün önce",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
      featured: false,
      link: "https://techcrunch.com"
    },
    {
      id: 6,
      title: "Startup'lar İçin 2026 Yatırım Trendleri: Derin Teknoloji ve Temiz Enerji Ön Planda",
      category: "startup",
      summary: "Girişim sermayesi fonları, genel yazılımlar yerine mikroçip tasarımı, kuantum hesaplama ve yapay zeka çipleri gibi derin teknoloji dikeylerine milyarlarca dolar ayırıyor.",
      source: "VC Insider",
      time: "7 dk okuma",
      date: "4 gün önce",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60",
      featured: false,
      link: "https://techcrunch.com"
    }
  ];

  React.useEffect(() => {
    const fetchRealNews = async () => {
      try {
        const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/feed/&api_key=&count=20");
        const data = await response.json();
        if (data.status === "ok" && data.items && data.items.length > 0) {
          const parsed = data.items.map((item, idx) => {
            const categories = (item.categories || []).map(c => c.toLowerCase());
            const titleLower = item.title.toLowerCase();
            
            let category = "dev";
            if (
              categories.some(c => c.includes("ai") || c.includes("intelligence") || c.includes("machine learning") || c.includes("gpt")) ||
              titleLower.includes("ai ") || titleLower.includes("gpt") || titleLower.includes("openai") || titleLower.includes("intelligence")
            ) {
              category = "ai";
            } else if (
              categories.some(c => c.includes("startup") || c.includes("venture") || c.includes("funding") || c.includes("invest")) ||
              titleLower.includes("funding") || titleLower.includes("startup") || titleLower.includes("raise") || titleLower.includes("invest")
            ) {
              category = "startup";
            }

            let image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60";
            if (item.thumbnail) {
              image = item.thumbnail;
            } else if (item.enclosure && item.enclosure.link) {
              image = item.enclosure.link;
            } else if (item.description && item.description.includes("<img")) {
              const match = item.description.match(/<img[^>]+src="([^">]+)"/);
              if (match && match[1]) {
                image = match[1];
              }
            }

            let summary = item.description || "";
            summary = summary.replace(/<[^>]*>/g, "").substring(0, 180) + "...";

            return {
              id: idx + 1,
              title: item.title,
              category: category,
              summary: summary,
              source: "TechCrunch",
              time: "4 dk okuma",
              date: new Date(item.pubDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" }),
              image: image,
              featured: idx < 3,
              link: item.link
            };
          });
          setNewsList(parsed);
        } else {
          setNewsList(getSimulatedNews());
        }
      } catch (err) {
        console.error("News fetch error:", err);
        setNewsList(getSimulatedNews());
      } finally {
        setLoading(false);
      }
    };

    fetchRealNews();
  }, []);

  const featuredList = newsList.filter(item => item.featured);
  const filteredNews = selectedCategory === "all"
    ? newsList
    : newsList.filter(item => item.category === selectedCategory);

  const nextSlide = () => {
    if (featuredList.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % featuredList.length);
  };

  const prevSlide = () => {
    if (featuredList.length === 0) return;
    setCurrentSlide(prev => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleBookmark = (title) => {
    if (addToast) addToast(`"${title.substring(0, 30)}..." favorilere eklendi! 📑`, "success");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 select-none font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="text-sm font-bold text-text-secondary tracking-wider uppercase animate-pulse">CVerse Haber Bülteni Yükleniyor...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 select-none font-sans"
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
            Teknoloji Haberleri
            <span className="text-[10px] tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black border border-primary/20">
              CVerse Bülten
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Yazılım, Yapay Zeka ve Girişimcilik dünyasındaki en güncel gelişmeleri tek bir noktadan takip edin.</p>
        </div>

        {/* Kategori Filtresi */}
        <div className="flex bg-bg-app p-1.5 rounded-2xl border border-border-soft shrink-0 overflow-x-auto max-w-full">
          {[
            { id: "all", label: "Tümü" },
            { id: "ai", label: "Yapay Zeka" },
            { id: "dev", label: "Yazılım" },
            { id: "startup", label: "Girişimler" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-card-secondary text-text-primary shadow border border-border-soft/50"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* CAROUSEL / ÖNE ÇIKAN HABERLER */}
      {selectedCategory === "all" && featuredList.length > 0 && (
        <motion.div variants={slideUp} className="relative group">
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border border-border-soft bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => window.open(featuredList[currentSlide].link, "_blank")}
              >
                <img
                  src={featuredList[currentSlide].image}
                  alt={featuredList[currentSlide].title}
                  className="w-full h-full object-cover opacity-45 hover:scale-102 transition-transform duration-[4000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Carousel Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3 text-left">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                      {featuredList[currentSlide].category === 'ai' ? 'YAPAY ZEKA' : featuredList[currentSlide].category === 'dev' ? 'YAZILIM' : 'GİRİŞİM'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-extrabold">{featuredList[currentSlide].source} • {featuredList[currentSlide].date}</span>
                  </div>
                  <h2 className="text-base md:text-xl font-black text-white leading-snug tracking-tight max-w-3xl">
                    {featuredList[currentSlide].title}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl font-medium">
                    {featuredList[currentSlide].summary}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Kontrolleri */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 dark:bg-black/20 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-sm pointer-events-auto cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 dark:bg-black/20 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-sm pointer-events-auto cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* HABER GRID LISTELEME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((news) => (
          <motion.div
            key={news.id}
            variants={slideUp}
            className="group"
          >
            <Card variant="primary" animate={false} className="flex flex-col h-full overflow-hidden transition-all duration-300">
              {/* Resim Alanı */}
              <div className="h-40 overflow-hidden relative shrink-0">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                  onClick={() => window.open(news.link, "_blank")}
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] font-black uppercase rounded tracking-wider border border-white/10">
                  {news.category === 'ai' ? 'YAPAY ZEKA' : news.category === 'dev' ? 'YAZILIM' : 'GİRİŞİM'}
                </span>
                <button
                  onClick={() => handleBookmark(news.title)}
                  className="absolute top-3 right-3 p-1.5 bg-bg-app text-text-secondary hover:text-primary rounded-lg transition-colors border border-border-soft"
                  title="Kaydet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Haber Detayı */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] text-text-secondary font-extrabold uppercase tracking-wider">
                    <span>{news.source}</span>
                    <span>{news.date}</span>
                  </div>
                  <h3 
                    className="text-xs md:text-sm font-black text-text-primary tracking-tight leading-snug group-hover:text-primary transition-colors cursor-pointer"
                    onClick={() => window.open(news.link, "_blank")}
                  >
                    {news.title}
                  </h3>
                  <p className="text-[10px] text-text-secondary line-clamp-3 leading-relaxed font-semibold">
                    {news.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-soft text-[10px] text-text-secondary font-bold">
                  <span>{news.time}</span>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-black shrink-0"
                  >
                    Devamını Oku
                    <svg xmlns="http://www.w3.org/2500/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default News;
