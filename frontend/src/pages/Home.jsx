import React, { useState, useEffect } from 'react';
import { Layers, Database, Cpu, UserPlus, Users, AlertTriangle, CheckCircle2, Loader2, Compass } from 'lucide-react';
import Card from '../components/Card';
import { apiService } from '../services/api';
import heroImage from '../assets/cverse_hero.png';

export default function Home() {
  // State for database integration
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for user registration form
  const [formData, setFormData] = useState({ AdSoyad: '', Email: '', KullaniciAdi: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(
        'ASP.NET Core Web API bağlantısı kurulamadı. Lütfen backend projesinin çalıştığından ve PostgreSQL bağlantısının aktif olduğundan emin olun.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      await apiService.createUser(formData);
      setSubmitSuccess(true);
      setFormData({ AdSoyad: '', Email: '', KullaniciAdi: '' });
      // Reload user list
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (err.errors) {
        // Detailed FluentValidation messages
        const messages = Object.values(err.errors).flatMap(x => x).join(' ');
        setSubmitError(messages || 'Validasyon hatası oluştu.');
      } else {
        setSubmitError(err.message || 'Kullanıcı oluşturulurken bir hata meydana geldi.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Glow circles behind */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5 mr-1.5 animate-spin-slow" /> Aşama 1: Temiz Mimari Altyapısı
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-cverse-text leading-[1.1] text-gradient">
              Kariyerinizi CVERSE ile Yeniden Tasarlayın
            </h1>
            
            <p className="text-base sm:text-lg text-cverse-text/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
              CVERSE, en yüksek yazılım standartlarına göre inşa edilen modern bir dijital ekosistemdir. 
              Stage 1 kapsamında tamamen temiz mimari (Clean Architecture), PostgreSQL entegrasyonu ve 
              gelişmiş FluentValidation kuralları içeren sürdürülebilir bir sistem kurulmuştur.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a 
                href="#kullanicilar" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                Kullanıcıları Keşfet
              </a>
              <a 
                href="#mimari" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-card-primary hover:bg-primary/10 text-text-primary border border-border-soft font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                Mimarimizi İncele
              </a>
            </div>

            {/* Quick Micro Stats */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div>
                <h4 className="text-2xl font-extrabold text-primary">.NET 8</h4>
                <p className="text-xs text-cverse-text/60 font-semibold uppercase mt-1">Backend Core</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-primary">React</h4>
                <p className="text-xs text-cverse-text/60 font-semibold uppercase mt-1">Frontend UI</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-primary">PGSQL</h4>
                <p className="text-xs text-cverse-text/60 font-semibold uppercase mt-1">Database</p>
              </div>
            </div>
          </div>

          {/* Right Vector Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[480px] aspect-square rounded-[2rem] bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center p-8 shadow-premium animate-float">
              {/* Glowing decorative background */}
              <div className="absolute inset-4 rounded-[1.8rem] bg-white/40 backdrop-blur-xl border border-white/60 -z-10 shadow-inner" />
              
              <img 
                src={heroImage} 
                alt="CVERSE Clean Architecture Technology Illustration" 
                className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section id="ozellikler" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Öne Çıkan Özellikler
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cverse-text">
            Mükemmel Mimarinin Yapı Taşları
          </h2>
          <p className="text-sm sm:text-base text-cverse-text/60 max-w-xl mx-auto">
            Ölçeklenebilir, test edilebilir ve sürdürülebilir bir sistem tasarımı için endüstriyel standartlardaki yazılım kurallarını uyguluyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            icon={Layers} 
            badge="Backend"
            title="Clean Architecture" 
            description="Domain, Application, Persistence, Infrastructure ve API katmanları arasında tamamen gevşek bağlı (decoupled) ve bağımsız bir yapı."
          />
          <Card 
            icon={Database} 
            badge="Veri Yönetimi"
            title="PostgreSQL & EF Core" 
            description="Güçlü PostgreSQL veritabanı entegrasyonu. Entity configurations ve otomatik migrations özellikleri ile hatasız şema yönetimi."
          />
          <Card 
            icon={Cpu} 
            badge="Gelişmiş Deneyim"
            title="Modern API Tasarımı" 
            description="Swagger belgeli .NET 8 Web API, global exception handling middleware ve Dribbble kalitesinde dinamik Tailwind React frontend."
          />
        </div>
      </section>

      {/* 3. ARCHITECTURE DIAGRAM SECTION */}
      <section id="mimari" className="bg-card-primary/40 py-20 border-y border-border-soft scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              Sistem Mimarisi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-cverse-text">
              Veri Akışı & Bağımlılık Şeması
            </h2>
            <p className="text-sm sm:text-base text-cverse-text/60 max-w-xl mx-auto">
              İsteklerin ve verilerin platform içerisindeki temiz akış şemasını ve güvenli katman yapısını keşfedin.
            </p>
          </div>

          {/* Clean Interactive Visual Map */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center max-w-5xl mx-auto">
            <div className="bg-app/85 p-6 rounded-2xl border border-border-soft text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Sunum Katmanı</span>
              <h4 className="font-bold text-text-primary">React Frontend</h4>
              <p className="text-xs text-text-secondary">Modern Vite + Tailwind UI istemcisi</p>
            </div>
            
            <div className="text-center text-primary font-bold hidden lg:block">➔</div>
            
            <div className="bg-app/85 p-6 rounded-2xl border border-border-soft text-center space-y-3 shadow-premium">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Giriş / API</span>
              <h4 className="font-bold text-text-primary">Cverse.API</h4>
              <p className="text-xs text-text-secondary">Controllers & Exception Middleware</p>
            </div>
            
            <div className="text-center text-primary font-bold hidden lg:block">➔</div>
            
            <div className="bg-app/85 p-6 rounded-2xl border border-border-soft text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">İş Mantığı</span>
              <h4 className="font-bold text-text-primary">Cverse.Application</h4>
              <p className="text-xs text-text-secondary">Services, DTOs & FluentValidators</p>
            </div>
          </div>

          <div className="mt-8 text-center text-primary font-bold hidden lg:block">⬇</div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-3xl mx-auto mt-8">
            <div className="bg-cverse-bg p-6 rounded-2xl border border-gray-100 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Veri Erişim</span>
              <h4 className="font-bold text-cverse-text">Cverse.Persistence</h4>
              <p className="text-xs text-cverse-text/60">AppDbContext & Repositories</p>
            </div>
            
            <div className="bg-cverse-bg p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center space-y-3 shadow-premium">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Çekirdek</span>
              <h4 className="font-bold text-cverse-text">Cverse.Domain</h4>
              <p className="text-xs text-cverse-text/60">Core Entities (User.cs)</p>
            </div>

            <div className="bg-cverse-bg p-6 rounded-2xl border border-gray-100 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Altyapı</span>
              <h4 className="font-bold text-cverse-text">Cverse.Infrastructure</h4>
              <p className="text-xs text-cverse-text/60">Dış Servisler (Scaffolding)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. USERS & DATABASE INTEGRATION PANEL */}
      <section id="kullanicilar" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Canlı Entegrasyon
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cverse-text">
            Sistem Kullanıcı Yönetimi
          </h2>
          <p className="text-sm sm:text-base text-cverse-text/60 max-w-xl mx-auto">
            React frontend istemcimizden backend API aracılığıyla PostgreSQL veritabanına doğrudan kayıt ekleyebilir ve listeleyebilirsiniz.
          </p>
        </div>

        {/* Dynamic Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Registration Form */}
          <div className="lg:col-span-5 bg-card-primary p-8 rounded-2xl border border-border-soft shadow-premium space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-border-soft">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary">Yeni Kullanıcı Kaydı</h3>
                <p className="text-xs text-text-secondary">PostgreSQL veri giriş formu</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Ad Soyad</label>
                <input 
                  type="text" 
                  value={formData.AdSoyad}
                  onChange={(e) => setFormData({ ...formData, AdSoyad: e.target.value })}
                  placeholder="örn. Ahmet Yılmaz"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-soft bg-app focus:outline-none focus:border-primary/50 text-sm font-medium transition-all text-text-primary placeholder-text-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">E-posta Adresi</label>
                <input 
                  type="email" 
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  placeholder="örn. ahmet@cverse.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-soft bg-app focus:outline-none focus:border-primary/50 text-sm font-medium transition-all text-text-primary placeholder-text-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  value={formData.KullaniciAdi}
                  onChange={(e) => setFormData({ ...formData, KullaniciAdi: e.target.value })}
                  placeholder="örn. ahmetyilmaz"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-soft bg-app focus:outline-none focus:border-primary/50 text-sm font-medium transition-all text-text-primary placeholder-text-secondary"
                />
              </div>

              {/* Status Alert Boxes inside Form */}
              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Kullanıcı veritabanına başarıyla eklendi!</span>
                </div>
              )}

              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{submitError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-75 shadow-md shadow-primary/10"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Veritabanına Kaydet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Live User Directory List */}
          <div className="lg:col-span-7 bg-card-secondary p-8 rounded-2xl border border-border-soft shadow-premium space-y-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Veritabanı Kullanıcı Listesi</h3>
                  <p className="text-xs text-text-secondary">PostgreSQL Users tablosu verileri</p>
                </div>
              </div>

              <button 
                onClick={fetchUsers}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-primary/10 border border-border-soft text-xs font-semibold text-text-primary transition-colors flex items-center space-x-1"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yenile'}
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow flex flex-col justify-center">
              {loading && users.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-medium text-cverse-text/60">Kullanıcı verileri sorgulanıyor...</p>
                </div>
              ) : error ? (
                /* Gorgeous, Soft fall back panel when API is not online */
                <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-amber-900 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm">Veri İletişim Durumu: Beklemede</h4>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-amber-800">
                    {error}
                  </p>

                  <div className="p-4 rounded-xl bg-white/80 border border-amber-100 text-xs text-cverse-text/80 space-y-2">
                    <p className="font-bold text-cverse-text">Sistemi Aktifleştirmek İçin:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-cverse-text/70 leading-relaxed">
                      <li>PostgreSQL sunucunuzu çalıştırın.</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded text-primary">backend/Cverse.API/.env</code> dosyasındaki veritabanı şifrenizi güncelleyin.</li>
                      <li>Backend klasöründe şu komutu çalıştırıp veritabanını oluşturun:<br/>
                        <code className="block bg-gray-900 text-gray-100 p-2 rounded mt-1 overflow-x-auto text-[10px]">
                          dotnet ef database update --project Cverse.Persistence --startup-project Cverse.API
                        </code>
                      </li>
                      <li>API'yi başlatın:<br/>
                        <code className="block bg-gray-900 text-gray-100 p-2 rounded mt-1 overflow-x-auto text-[10px]">
                          dotnet run --project Cverse.API
                        </code>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-cverse-text/40">Veritabanında henüz kayıtlı kullanıcı yok.</p>
                  <p className="text-xs text-cverse-text/30">Soldaki formu doldurarak ilk kullanıcıyı kaydedebilirsiniz!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 rounded-xl bg-app/80 border border-border-soft flex items-start space-x-3 shadow-sm hover:border-primary/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-primary text-sm uppercase">
                        {user.adSoyad.substring(0, 2)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-sm text-text-primary truncate">{user.adSoyad}</h4>
                        <p className="text-xs text-text-secondary truncate">@{user.kullaniciAdi}</p>
                        <p className="text-[10px] text-text-secondary/80 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
