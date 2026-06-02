using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Context
{
    public static class DbSeeder
    {
        public static async Task SeedUsersAndDataAsync(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            var mockUsers = new List<(string Name, string Email, string Username, string Title, string Bio, string Location, string ProfilePic, string PostContent)>
            {
                (
                    "Cverse Admin",
                    "admin@cverse.com",
                    "admin",
                    "System Administrator",
                    "CVERSE Platform Yönetici Hesabı.",
                    "Ankara, TR",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
                    "Cverse kariyer platformu yönetim paneli devreye alınmıştır. Sistem üzerindeki analizleri Yönetici Paneli sekmesinden takip edebilirsiniz."
                ),
                (
                    "Canan Demir",
                    "canan.demir@cverse.com",
                    "canandemir",
                    "Senior Frontend Engineer | UI/UX Enthusiast",
                    "Passionate about building responsive, accessible, and high-performance user interfaces with React and TailwindCSS.",
                    "İstanbul, TR",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                    "Yapay zeka araçlarının (GenAI) frontend geliştirme süreçlerine etkisi üzerine bir araştırma yapıyorum. Kod yazmayı hızlandırsa da temiz kod mimarisi ve kullanıcı deneyimi (UX) hala insan dokunuşu gerektiriyor. Sizce gelecekte frontend nasıl şekillenecek?"
                ),
                (
                    "Kaan Yılmaz",
                    "kaan.yilmaz@cverse.com",
                    "kaanyilmaz",
                    ".NET Core Architect & Cloud Specialist",
                    "Designing scalable microservices and robust database architectures using C#, ASP.NET Core, and PostgreSQL.",
                    "Ankara, TR",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                    "Bugün microservice mimarilerinde data consistency konusunu ele aldık. Outbox pattern kullanarak Eventual Consistency sağlamak, distributed sistemlerde hayat kurtarıyor. .NET Core ve RabbitMQ ikilisi bu konuda çok başarılı."
                ),
                (
                    "Elif Şahin",
                    "elif.sahin@cverse.com",
                    "elifsahin",
                    "Flutter Developer | Mobile Enthusiast",
                    "Building beautiful, high-performance cross-platform mobile apps for iOS and Android.",
                    "İzmir, TR",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                    "Flutter 3.x ile gelen yeni rendering engine Impeller'ı projelerimizde test etmeye başladık. iOS cihazlardaki o can sıkıcı shader stuttering (takılma) sorunu tamamen ortadan kalkmış gibi duruyor!"
                ),
                (
                    "Mert Kaya",
                    "mert.kaya@cverse.com",
                    "mertkaya",
                    "Data Scientist & AI Specialist",
                    "Developing machine learning algorithms, NLP, and intelligent recommendation systems with Python.",
                    "Remote",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
                    "Büyük dil modellerini (LLM) yerel sunucularda çalıştırmak için Llama.cpp ve Ollama kullanıyoruz. Donanım maliyetleri ve veri güvenliği açısından inanılmaz bir özgürlük sağlıyor."
                ),
                (
                    "Dilek Aslan",
                    "dilek.aslan@cverse.com",
                    "dilekaslan",
                    "Product Manager | Tech Lead",
                    "Bridging the gap between engineering, design, and business goals to deliver world-class products.",
                    "İstanbul, TR",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
                    "Bir ürün yöneticisi olarak en büyük zorluk, teknik borçlar (technical debt) ile yeni özellik talepleri (feature requests) arasındaki o hassas dengeyi kurabilmek. Mühendislik ekibinin sesine kulak vermek her zaman kazandırır."
                ),
                (
                    "Burak Öztürk",
                    "burak.ozturk@cverse.com",
                    "burakozturk",
                    "DevOps & Cloud Infrastructure Engineer",
                    "Automating CI/CD pipelines and managing cloud deployments using Kubernetes, Docker, and AWS.",
                    "Remote",
                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
                    "Kubernetes cluster'larımızı AWS EKS üzerine sorunsuz bir şekilde taşıdık. Helm ve Terraform ikilisi sayesinde artık tüm altyapı bir kod dosyası kadar kolay yönetilebilir durumda (IaC)."
                ),
                (
                    "Zeynep Çelik",
                    "zeynep.celik@cverse.com",
                    "zeynepcelik",
                    "Full Stack Engineer (Node.js / React)",
                    "Specialized in fast prototyping and building robust web applications end-to-end.",
                    "İzmir, TR",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
                    "TypeScript kullanmaya başladıktan sonra JavaScript projelerimde aldığım runtime hataları %80 azaldı diyebilirim. Kesinlikle her geliştiricinin standart araç çantasında olmalı."
                ),
                (
                    "Onur Koç",
                    "onur.koc@cverse.com",
                    "onurkoc",
                    "Security Engineer & Ethical Hacker",
                    "Securing applications and systems against modern cyber threats.",
                    "Ankara, TR",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
                    "Web uygulamalarında güvenlik açıkları en çok API endpoint'lerinde yaşanıyor. Broken Object Level Authorization (BOLA) açıkları hala OWASP Top 10 listesinin zirvesinde. API yetkilendirmelerinizi sıkı tutun."
                ),
                (
                    "Selin Yıldız",
                    "selin.yildiz@cverse.com",
                    "selinyildiz",
                    "Senior Product Designer",
                    "Designing beautiful, intuitive user journeys and modern wireframes.",
                    "İstanbul, TR",
                    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
                    "Kullanıcı deneyimi tasarlarken sadelik en güçlü silahtır. Arayüzü karıştırmadan, kullanıcının hedefine en az tıklamayla ulaşmasını sağlamak gerçek tasarım dehasıdır."
                ),
                (
                    "Yiğit Arslan",
                    "yigit.arslan@cverse.com",
                    "yigitarslan",
                    "QA & Software Test Automation Lead",
                    "Ensuring top-notch product quality with automated E2E and unit testing.",
                    "Bursa, TR",
                    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
                    "Yazılım test otomasyonunda Selenium'dan Playwright'a geçiş yaptık. Paralel test çalıştırma hızı ve otomatik wait (bekleme) mekanizması geliştirici deneyimini bambaşka bir seviyeye taşıyor."
                )
            };

            var baseDate = new DateTime(2026, 5, 22, 12, 0, 0, DateTimeKind.Utc);

            foreach (var item in mockUsers)
            {
                // Her kullanıcının varlığını e-posta adresinden kontrol et
                var existingUser = await userManager.FindByEmailAsync(item.Email);
                if (existingUser != null)
                {
                    continue; // Eğer kullanıcı zaten varsa ekleme, bir sonrakine geç
                }
                var user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    AdSoyad = item.Name,
                    Email = item.Email,
                    UserName = item.Username,
                    ProfilFotografiUrl = item.ProfilePic,
                    KapakFotografiUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
                    OlusturmaTarihi = baseDate,
                    EmailConfirmed = true
                };

                // Tüm kullanıcılar için standart güvenli bir şifre belirliyoruz
                var result = await userManager.CreateAsync(user, "Cverse123!");

                if (result.Succeeded)
                {
                    // Profil Bilgilerini Oluştur
                    var profile = new UserProfile
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Unvan = item.Title,
                        Bio = item.Bio,
                        Konum = item.Location,
                        LinkedInUrl = $"https://linkedin.com/in/{item.Username}",
                        GitHubUrl = $"https://github.com/{item.Username}",
                        TwitterUrl = $"https://twitter.com/{item.Username}",
                        WebsiteUrl = $"https://{item.Username}.dev",
                        OlusturmaTarihi = baseDate,
                        GuncellemeTarihi = baseDate
                    };

                    context.UserProfiles.Add(profile);

                    // Geliştirici için 1 adet gönderi (post) ekle
                    var post = new Post
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Content = item.PostContent,
                        CreatedAt = baseDate.AddMinutes(new Random().Next(10, 180))
                    };

                    context.Posts.Add(post);
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
