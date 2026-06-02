# 🚀 CVERSE - Profesyonel Kariyer ve Sosyal Paylaşım Platformu

CVERSE, modern yazılım mühendisleri ve teknoloji profesyonelleri için tasarlanmış; gerçek zamanlı akış (feed), mesajlaşma, iş ilanları, mini oyunlar ve yapay zeka destekli CV analizi sunan premium bir kariyer platformudur.

Bu proje, backend tarafında **Clean Architecture** prensiplerine uygun **ASP.NET Core 8.0 Web API** ve veri tabanı tarafında **PostgreSQL** kullanırken, frontend tarafında son derece şık, göz alıcı ve parlama yapmayan premium bir arayüz sunan **Vite + React** ve **Tailwind CSS v4** teknolojilerini kullanmaktadır.

---

### Katmanlar ve Teknolojiler:
1. **Cverse.Domain:** Temel iş modelleri ve veritabanı varlıklarını (User, Profile, Post, Job, Message vb.) barındırır.
2. **Cverse.Application:** İş kurallarını, arayüz servis tanımlarını (Interfaces) ve DTO nesnelerini yönetir.
3. **Cverse.Persistence:** PostgreSQL entegrasyonu, Entity Framework Core veritabanı bağlamı (`AppDbContext`) ve veritabanı yapılandırmalarını içerir.
4. **Cverse.Infrastructure:** SignalR gerçek zamanlı iletişim altyapısı, JWT token üretimi ve Google Gemini AI CV analizi entegrasyonlarını sağlar.
5. **Cverse.API:** REST API uç noktalarını (controllers), program başlangıç ayarlarını (`Program.cs`) ve WebSocket Hub'larını sunar.
6. **Frontend:** React tabanlı, aydınlık/karanlık temayı kusursuz bir şekilde senkronize eden, cam morfolojisi (glassmorphism) ve yumuşak gece mavisi tonlarıyla göz yormayan premium bir arayüzdür.

---

## ✨ Ekran Görüntüleri

Aşağıda projenin bazı arayüz ekranları yer almaktadır:

- 🏠 Ana Sayfa (Feed)
<p align="center"> <img src="https://github.com/user-attachments/assets/3f770601-7ee8-4811-9064-28971550828a" width="250"/> <img src="https://github.com/user-attachments/assets/f2772254-1aee-44c8-97a2-8239556ac79b" width="250"/> </p>

---

- 👤 Profil Sayfası
<p align="center"> <img src="https://github.com/user-attachments/assets/dea34472-6ff3-4386-97e1-6064a35480e8" width="250"/> <img src="https://github.com/user-attachments/assets/428e5484-d0b4-46e8-8cd5-af803754e9d1" width="250"/> <img src="https://github.com/user-attachments/assets/cab282d9-cfda-4ff8-917d-69d1e9316535" width="250"/> <img src="https://github.com/user-attachments/assets/f07437f4-198b-4db3-ab69-9269f61a8822" width="250"/> </p>

---

- 🔍 Keşfet
<p align="center"> <img src="https://github.com/user-attachments/assets/14af8576-86c6-46f0-8796-a98483f8ed56" width="250"/> </p>

---

- 💬 Mesajlaşma Sistemi
<p align="center"> <img src="https://github.com/user-attachments/assets/e904aa59-5a1f-413d-8224-902ee603dd16" width="250"/> </p>

---

- 💼 İş İlanları
<p align="center"> <img src="https://github.com/user-attachments/assets/e42e36a1-836a-4ba2-8211-9d74c40f2015" width="250"/> <img src="https://github.com/user-attachments/assets/9483dfee-7d20-40b1-9031-f31019c79e84" width="250"/> </p>

---

- 🧠 CV Analizi (AI)
<p align="center"> <img src="https://github.com/user-attachments/assets/9c33b66b-338a-4b12-b434-ba19ad46cde4" width="250"/> <img src="https://github.com/user-attachments/assets/2c5299f2-19af-4c7d-981a-95bc97bb4e22" width="250"/> <img src="https://github.com/user-attachments/assets/6d668b1e-e694-49a8-895d-e21ce8295ae6" width="250"/> </p>

---

- ⚙️ Ayarlar
<p align="center"> <img src="https://github.com/user-attachments/assets/3c74f08a-69ae-4c06-946e-4865a63f52a1" width="250"/> <img src="https://github.com/user-attachments/assets/a5483095-278e-47f2-92bd-80eed1efb5f5" width="250"/> </p>

---

- 🎮 Oyun
<p align="center"> <img src="https://github.com/user-attachments/assets/102e9563-83a2-4a47-8751-7aa80034a0c2" width="250"/> <img src="https://github.com/user-attachments/assets/a4a1557c-09b0-48ae-9c20-9fa51899ab65" width="250"/> </p>

---

- 👨‍💼 Admin Paneli
<img width="1904" height="1026" alt="Ekran görüntüsü 2026-06-02 152554" src="https://github.com/user-attachments/assets/589dfe65-93a1-46f4-953e-4580ce3bdac2" />
<img width="1911" height="1029" alt="Ekran görüntüsü 2026-06-02 152620" src="https://github.com/user-attachments/assets/cb23650c-4c07-45f4-8197-434280cd7c65" />
<img width="1907" height="1027" alt="Ekran görüntüsü 2026-06-02 152704" src="https://github.com/user-attachments/assets/ed5378ee-71e6-4483-993b-dcf63da59868" />
<img width="1910" height="1026" alt="Ekran görüntüsü 2026-06-02 152503" src="https://github.com/user-attachments/assets/103d16a2-1cfd-4f85-90ee-99910d9d803d" />


---

- ℹ️ Hakkında
<img width="1895" height="1033" alt="Ekran görüntüsü 2026-06-02 152340" src="https://github.com/user-attachments/assets/9280e306-2fc0-4245-9f4d-945d05d23dcd" />
<img width="1905" height="1030" alt="Ekran görüntüsü 2026-06-02 152323" src="https://github.com/user-attachments/assets/b0499927-5a30-4aac-a6b5-dbb50b70944a" />


---

- 📞 İletişim
<img width="1904" height="1029" alt="Ekran görüntüsü 2026-06-02 152403" src="https://github.com/user-attachments/assets/875bc629-507c-4240-a417-58172bf4144e" />


---

## 🛠️ Kullanılan Teknolojiler

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core
- PostgreSQL
- SignalR (real-time communication)
- JWT Authentication
- Google Gemini AI (CV analizi)

### Frontend
- React (Vite)
- Tailwind CSS v4
- Axios
- React Router

---

## 🧠 Proje Özeti

CVERSE; modern yazılım mimarisi, gerçek zamanlı iletişim ve yapay zeka entegrasyonu üzerine kurulmuş bir platformdur.

Kullanıcılar:
- Profil oluşturabilir
- Post paylaşabilir
- Diğer kullanıcılarla mesajlaşabilir
- İş ilanlarını görüntüleyebilir
- AI destekli CV analizi alabilir

---

## 💻 Bilgisayarınızda Çalıştırma Adımları

### 1. Backend API'yi Başlatma

1. Bir terminal (PowerShell veya CMD) açın ve `backend` klasörüne geçiş yapın:
   ```bash
   cd backend
   ```
2. `Cverse.API` klasörünün içindeki `.env` dosyasını bir metin editörüyle açın ve kendi PostgreSQL bağlantı bilgilerinize ve Gemini API anahtarınıza göre düzenleyin:
   - `DB_CONNECTION_STRING` -> PostgreSQL bağlantı metniniz.
   - `GEMINI_API_KEY` -> Yapay zeka ile CV analizi için Google AI Studio'dan alacağınız ücretsiz API anahtarı.
3. Bağımlılıkları geri yükleyin ve API'yi çalıştırın:
   ```bash
   dotnet run --project Cverse.API
   ```
4. API başarıyla başladığında tarayıcınızdan `http://localhost:5068/swagger` (port değişebilir, terminalde yazacaktır) adresine girerek **Swagger** arayüzü üzerinden tüm API uç noktalarını görsel olarak test edebilirsiniz.

---

### 2. Frontend Uygulamasını Başlatma

1. Yeni bir terminal penceresi açın ve `frontend` klasörüne geçiş yapın:
   ```bash
   cd frontend
   ```
2. Gerekli tüm paketleri ve kütüphaneleri yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı geliştirme modunda (development) başlatın:
   ```bash
   npm run dev
   ```
4. Terminalde yazan adrese (genellikle `http://localhost:5173`) tarayıcınızdan giriş yaparak premium CVERSE arayüzünü kullanmaya başlayabilirsiniz!

---

## 🚀 Geliştirici Notu

Bu proje Clean Architecture prensiplerine uygun olarak modüler ve ölçeklenebilir şekilde geliştirilmiştir.  
Gerçek zamanlı sistemler, API tabanlı yapı ve AI entegrasyonu ile modern yazılım mimarisini temsil etmektedir.

---

## 👩🏻‍💻 Geliştirici

**Ayşe Yağmur Süzgün**


