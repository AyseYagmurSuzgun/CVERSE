🚀 CVERSE - Profesyonel Kariyer ve Sosyal Paylaşım Platformu
CVERSE, modern yazılım mühendisleri ve teknoloji profesyonelleri için tasarlanmış; gerçek zamanlı akış (feed), mesajlaşma, iş ilanları, mini oyunlar ve yapay zeka destekli CV analizi sunan premium bir kariyer platformudur.

Bu proje, backend tarafında Clean Architecture prensiplerine uygun ASP.NET Core 9.0 Web API ve veri tabanı tarafında PostgreSQL kullanırken, frontend tarafında son derece şık, göz alıcı ve parlama yapmayan premium bir arayüz sunan Vite + React ve Tailwind CSS v4 teknolojilerini kullanmaktadır.

Katmanlar ve Teknolojiler:
Cverse.Domain: Temel iş modelleri ve veritabanı varlıklarını (User, Profile, Post, Job, Message vb.) barındırır.
Cverse.Application: İş kurallarını, arayüz servis tanımlarını (Interfaces) ve DTO nesnelerini yönetir.
Cverse.Persistence: PostgreSQL entegrasyonu, Entity Framework Core veritabanı bağlamı (AppDbContext) ve veritabanı yapılandırmalarını içerir.
Cverse.Infrastructure: SignalR gerçek zamanlı iletişim altyapısı, JWT token üretimi ve Google Gemini AI CV analizi entegrasyonlarını sağlar.
Cverse.API: REST API uç noktalarını (controllers), program başlangıç ayarlarını (Program.cs) ve WebSocket Hub'larını sunar.
Frontend: React tabanlı, aydınlık/karanlık temayı kusursuz bir şekilde senkronize eden, cam morfolojisi (glassmorphism) ve yumuşak gece mavisi tonlarıyla göz yormayan premium bir arayüzdür.

✨ Ekran Görüntüleri
Aşağıda projenin bazı arayüz ekranları yer almaktadır:

🏠 Ana Sayfa (Feed)
 

👤 Profil Sayfası
   

🔍 Keşfet


💬 Mesajlaşma Sistemi


💼 İş İlanları
 

🧠 CV Analizi (AI)
  

⚙️ Ayarlar
 

🎮 Oyun


👑 Yönetici (Admin) Paneli


📄 Hakkında Sayfası (Footer)


✉️ İletişim Sayfası (Footer)
 

---
🛠️ Kullanılan Teknolojiler
Backend
ASP.NET Core 9 Web API
Entity Framework Core
PostgreSQL
SignalR (real-time communication)
JWT Authentication
Google Gemini AI (CV analizi)
Frontend
React (Vite)
Tailwind CSS v4
Axios
React Router

🧠 Proje Özeti
CVERSE; modern yazılım mimarisi, gerçek zamanlı iletişim ve yapay zeka entegrasyonu üzerine kurulmuş bir platformdur.

Kullanıcılar:

*   Profil oluşturabilir
*   Post paylaşabilir
*   Diğer kullanıcılarla mesajlaşabilir
*   İş ilanlarını görüntüleyebilir
*   AI destekli CV analizi alabilir
*   Footer'daki **Hakkında** sayfası üzerinden platform rehberine ulaşabilir
*   Footer'daki **İletişim** sayfası üzerinden destek ve geri bildirim mesajı gönderebilir

Yöneticiler (Admin):

*   Tüm kullanıcıları, gönderileri ve iş ilanlarını denetleyip silebilir
*   Canlı dağılım grafiklerini ve sistem loglarını gerçek zamanlı izleyebilir
*   Kullanıcılardan gelen iletişim mesajlarını inceleyip yönetebilir

💻 Bilgisayarınızda Çalıştırma Adımları
1. Backend API'yi Başlatma
Bir terminal (PowerShell veya CMD) açın ve backend klasörüne geçiş yapın:
cd backend
Cverse.API klasörünün içindeki .env dosyasını bir metin editörüyle açın ve kendi PostgreSQL bağlantı bilgilerinize ve Gemini API anahtarınıza göre düzenleyin:
DB_CONNECTION_STRING -> PostgreSQL bağlantı metniniz.
GEMINI_API_KEY -> Yapay zeka ile CV analizi için Google AI Studio'dan alacağınız ücretsiz API anahtarı.
Bağımlılıkları geri yükleyin ve API'yi çalıştırın:
dotnet run --project Cverse.API
API başarıyla başladığında tarayıcınızdan http://localhost:5068/swagger (port değişebilir, terminalde yazacaktır) adresine girerek Swagger arayüzü üzerinden tüm API uç noktalarını görsel olarak test edebilirsiniz.

2. Frontend Uygulamasını Başlatma
Yeni bir terminal penceresi açın ve frontend klasörüne geçiş yapın:
cd frontend
Gerekli tüm paketleri ve kütüphaneleri yükleyin:
npm install
Uygulamayı geliştirme modunda (development) başlatın:
npm run dev
Terminalde yazan adrese (genellikle http://localhost:5173) tarayıcınızdan giriş yaparak premium CVERSE arayüzünü kullanmaya başlayabilirsiniz!

🚀 Geliştirici Notu
This proje Clean Architecture prensiplerine uygun olarak modüler ve ölçeklenebilir şekilde geliştirilmiştir.
Gerçek zamanlı sistemler, API tabanlı yapı ve AI entegrasyonu ile modern yazılım mimarisini temsil etmektedir.

👩🏻💻 Geliştirici
Ayşe Yağmur Süzgün
