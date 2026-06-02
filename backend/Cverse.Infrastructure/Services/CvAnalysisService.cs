using Cverse.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Cverse.Application.DTOs;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;

namespace Cverse.Infrastructure.Services
{
    // ICvAnalysisService arayüzünün (interface) birebir ve tam implementasyonu
    public class CvAnalysisService : ICvAnalysisService
    {
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public CvAnalysisService(AppDbContext context, IFileService fileService, IConfiguration configuration, HttpClient httpClient)
        {
            _context = context;
            _fileService = fileService;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<CvAnalysisDto> AnalyzeCvAsync(Guid userId, IFormFile file)
        {
            ValidatePdfFile(file);

            // 1. Dosyayı kaydet ve metni çıkart
            var pdfUrl = await _fileService.UploadImageAsync(file, "cvs");
            string extractedText = await ExtractTextFromPdfAsync(file);

            if (string.IsNullOrWhiteSpace(extractedText) || extractedText.Length < 100)
                throw new Exception("Dosya okunamadı veya CV olarak analiz edilemeyecek kadar kısa.");

            // 1.5. Hızlı Ön Doğrulama ve Dil Tespiti (Maliyet ve Hata Önleyici)
            string detectedLanguage = DetectCvLanguageAndValidate(extractedText);

            // 2. Gemini AI'a analiz için gönder
            var aiResult = await AnalyzeWithGeminiAsync(extractedText, detectedLanguage);

            // 3. Geçerli CV kontrolü (AI tabanlı)
            if (!aiResult.IsCv)
            {
                await _fileService.DeleteImageAsync(pdfUrl); // Gereksiz dosyayı sil
                throw new Exception("Bu dosya bir CV (özgeçmiş) dosyası gibi görünmüyor. Lütfen geçerli bir özgeçmiş yükleyin.");
            }

            // 4. Veritabanına kaydet
            var analysis = new CvAnalysis
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OriginalFileName = file.FileName,
                UploadedPdfUrl = pdfUrl,
                ParsedText = extractedText,
                AtsScore = aiResult.AtsScore,
                ScoreTechnical = aiResult.ScoreTechnical,
                ScoreExperience = aiResult.ScoreExperience,
                ScoreFormatting = aiResult.ScoreFormatting,
                ScoreImpact = aiResult.ScoreImpact,
                ExperienceLevel = aiResult.ExperienceLevel,
                TechnicalSkills = aiResult.TechnicalSkills ?? new(),
                MissingSkills = aiResult.MissingSkills ?? new(),
                Strengths = aiResult.Strengths ?? new(),
                Weaknesses = aiResult.Weaknesses ?? new(),
                JobSuggestions = aiResult.JobSuggestions ?? new(),
                ImprovementSuggestions = aiResult.ImprovementSuggestions ?? new(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<CvAnalysis>().Add(analysis);
            await _context.SaveChangesAsync();

            return MapToDto(analysis);
        }

        public async Task<IEnumerable<CvAnalysisDto>> GetMyAnalysesAsync(Guid userId)
        {
            var list = await _context.Set<CvAnalysis>()
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return list.Select(MapToDto);
        }

        public async Task<CvAnalysisDto> GetAnalysisByIdAsync(Guid userId, Guid analysisId)
        {
            var item = await _context.Set<CvAnalysis>()
                .FirstOrDefaultAsync(c => c.Id == analysisId && c.UserId == userId);
            
            if (item == null) throw new KeyNotFoundException("Analiz sonucu bulunamadı.");
            return MapToDto(item);
        }

        public async Task<bool> DeleteAnalysisAsync(Guid userId, Guid analysisId)
        {
            var item = await _context.Set<CvAnalysis>()
                .FirstOrDefaultAsync(c => c.Id == analysisId && c.UserId == userId);
            
            if (item == null) return false;

            try
            {
                if (!string.IsNullOrEmpty(item.UploadedPdfUrl))
                {
                    await _fileService.DeleteImageAsync(item.UploadedPdfUrl);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Dosya silme hatası]: {ex.Message}");
            }

            _context.Set<CvAnalysis>().Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        private void ValidatePdfFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Geçersiz dosya.");
            if (file.Length > 5 * 1024 * 1024)
                throw new Exception("Dosya boyutu 5MB'dan küçük olmalıdır.");
            if (Path.GetExtension(file.FileName).ToLower() != ".pdf" || (file.ContentType != "application/pdf" && file.ContentType != "application/x-pdf"))
                throw new Exception("Sadece PDF formatındaki dosyalar kabul edilmektedir.");
        }

        private async Task<string> ExtractTextFromPdfAsync(IFormFile file)
        {
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            StringBuilder text = new();

            try
            {
                // iText7 kütüphanesini UglyToad'dan ayırmak ve tam uyum sağlamak için explicit (tam adıyla) tanımladık
                using (var pdfReader = new iText.Kernel.Pdf.PdfReader(stream))
                using (var pdfDocument = new iText.Kernel.Pdf.PdfDocument(pdfReader))
                {
                    var numberOfPages = pdfDocument.GetNumberOfPages();

                    for (int i = 1; i <= numberOfPages; i++)
                    {
                        try
                        {
                            var page = pdfDocument.GetPage(i);
                            // Sayfadaki metni yapısal ve biçimsel hatalara takılmadan kurtarır
                            var pageText = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);
                            
                            if (!string.IsNullOrEmpty(pageText))
                            {
                                text.AppendLine(pageText);
                            }
                        }
                        catch (Exception pageEx)
                        {
                            Console.WriteLine($"[iText Sayfa {i} Okuma Hatası Pas Geçildi]: {pageEx.Message}");
                        }
                    }
                }
            }
            catch (Exception docEx)
            {
                Console.WriteLine($"[iText Ağır Döküman Hatası]: {docEx.Message}");
                throw new Exception("Yüklediğiniz PDF dosyası hiçbir şekilde okunamıyor. Lütfen dosyanın bozuk olmadığından emin olun.");
            }

            return text.ToString().Replace("\0", "").Trim();
        }

        // 👈 YENİ: CV İskelet Doğrulaması ve Dil Algılama Sistemi
        private string DetectCvLanguageAndValidate(string text)
        {
            var textLower = text.ToLowerInvariant();
            
            // Temel CV Section Keyword'leri
            var trKeywords = new[] { "eğitim", "deneyim", "yetenek", "sertifika", "özgeçmiş", "iletişim", "projeler", "iş tecrübesi", "hakkımda", "beceriler", "başarılar" };
            var enKeywords = new[] { "education", "experience", "skills", "certifications", "resume", "contact", "projects", "work history", "about me", "profile", "achievements" };

            int trCount = trKeywords.Count(kw => textLower.Contains(kw));
            int enCount = enKeywords.Count(kw => textLower.Contains(kw));

            // Eğer dosya çok kısaysa ve hiçbir CV anahtar kelimesi içermiyorsa direkt reddet (Gemini API'yi yorma)
            if (trCount < 2 && enCount < 2 && text.Length < 600)
            {
                throw new Exception("Bu dosya bir özgeçmiş (CV) formatında görünmüyor. Lütfen içinde 'Eğitim', 'Deneyim', 'Yetenekler' gibi başlıkların bulunduğu geçerli bir CV PDF'i yükleyin.");
            }

            return trCount >= enCount ? "Turkish" : "English";
        }

        private async Task<AiCvResponse> AnalyzeWithGeminiAsync(string cvText, string detectedLanguage)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("[CvAnalysisService] WARNING: Gemini API Key is missing! Falling back to high-fidelity deterministic engine.");
                return GetDeterministicFallbackAnalysis(cvText, detectedLanguage);
            }

            // Token sınırlarını aşmamak için metni güvenli kesme
            string safeCvText = string.IsNullOrEmpty(cvText) ? "" : cvText.Substring(0, Math.Min(cvText.Length, 14000));

            string prompt = $@"
You are an expert ATS (Applicant Tracking System) and AI Recruiter. Carefully analyze the following text extracted from a document.

1. VALIDATION: Determine if the document is actually a CV/Resume. If it's a random document, book, or article, set 'isCv' to false and leave other fields empty/0.
2. LANGUAGE & CONTEXT: The document is primarily written in {detectedLanguage}. Evaluate the grammar, professional tone, and keywords based on {detectedLanguage} standards.
3. SCORING (CRITICAL): Calculate a deeply analytical ATS score (0-100). Do NOT generate random scores. Base it STRICTLY on: Technical Skills Match (ScoreTechnical), Experience Relevance (ScoreExperience), Formatting/Readability (ScoreFormatting), and Overall Impact (ScoreImpact).
4. EXTRACTION: Extract technical skills, missing skills (industry standards they lack), strengths, weaknesses, job suggestions, and improvement suggestions.
5. FORMAT: Output MUST be ONLY in valid JSON matching the requested structure. Your output strings MUST be translated to Turkish language regardless of the CV language.

Required JSON structure:
{{
  ""isCv"": true/false,
  ""atsScore"": 85,
  ""scoreTechnical"": 90,
  ""scoreExperience"": 80,
  ""scoreFormatting"": 85,
  ""scoreImpact"": 75,
  ""experienceLevel"": ""Mid-Level"",
  ""technicalSkills"": [""C#"", ""React""],
  ""missingSkills"": [""Docker"", ""CI/CD""],
  ""strengths"": [""Strong backend knowledge""],
  ""weaknesses"": [""No cloud experience mentioned""],
  ""jobSuggestions"": [""Full Stack Developer"", "".NET Developer""],
  ""improvementSuggestions"": [""Add a summary section"", ""Quantify your achievements""]
}}

CV TEXT:
{safeCvText}
";

            var requestBody = new 
            { 
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { responseMimeType = "application/json" }
            };

            var modelsToTry = new[] { "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash" };
            string lastErrorMessage = "";

            foreach (var model in modelsToTry)
            {
                try
                {
                    Console.WriteLine($"[CvAnalysisService] Attempting CV analysis with model: {model}");
                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                    
                    var response = await _httpClient.PostAsJsonAsync(url, requestBody);
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"[CvAnalysisService] Model {model} failed with status: {response.StatusCode}. Details: {errorContent}");
                        lastErrorMessage = $"Status: {response.StatusCode}, Details: {errorContent}";
                        
                        // Transient errors: Wait a bit before trying the next model
                        await Task.Delay(1000);
                        continue;
                    }

                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(responseContent);
                    var root = document.RootElement;
                    var aiTextResponse = root.GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text").GetString();

                    var cleanJson = aiTextResponse!.Trim();
                    
                    // Simple cleaning just in case response is wrapped in markdown blocks
                    if (cleanJson.StartsWith("```json"))
                        cleanJson = cleanJson.Substring(7).Trim();
                    if (cleanJson.EndsWith("```"))
                        cleanJson = cleanJson.Substring(0, cleanJson.Length - 3).Trim();

                    var deserialized = JsonSerializer.Deserialize<AiCvResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (deserialized != null)
                    {
                        Console.WriteLine($"[CvAnalysisService] Successfully completed CV analysis using model: {model}");
                        return deserialized;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CvAnalysisService] Exception during analysis with model {model}: {ex.Message}");
                    lastErrorMessage = ex.Message;
                    await Task.Delay(1000); // Backoff before next attempt
                }
            }

            // If we reached here, all API requests failed. Fallback to High-Fidelity Deterministic Parser.
            Console.WriteLine($"[CvAnalysisService] WARNING: All Gemini API model attempts failed. Last error: {lastErrorMessage}. Falling back to high-fidelity deterministic parser engine.");
            return GetDeterministicFallbackAnalysis(cvText, detectedLanguage);
        }

        private AiCvResponse GetDeterministicFallbackAnalysis(string cvText, string detectedLanguage)
        {
            var textLower = cvText.ToLowerInvariant();
            var response = new AiCvResponse
            {
                IsCv = true,
                AtsScore = 70,
                ScoreTechnical = 70,
                ScoreExperience = 70,
                ScoreFormatting = 75,
                ScoreImpact = 65,
                ExperienceLevel = "Mid-Level"
            };

            var skillKeywords = new Dictionary<string, string>
            {
                { "c#", "C#" },
                { "dotnet", ".NET Core" },
                { "asp.net", "ASP.NET Core" },
                { "react", "React" },
                { "angular", "Angular" },
                { "vue", "Vue.js" },
                { "typescript", "TypeScript" },
                { "javascript", "JavaScript" },
                { "node", "Node.js" },
                { "python", "Python" },
                { "java", "Java" },
                { "spring", "Spring Boot" },
                { "docker", "Docker" },
                { "kubernetes", "Kubernetes" },
                { "aws", "AWS" },
                { "azure", "Azure" },
                { "sql", "SQL / PostgreSQL" },
                { "nosql", "NoSQL" },
                { "mongodb", "MongoDB" },
                { "redis", "Redis" },
                { "git", "Git" },
                { "ci/cd", "CI/CD" },
                { "devops", "DevOps" },
                { "microservices", "Mikroservisler" },
                { "rabbitmq", "RabbitMQ" }
            };

            var foundSkills = new List<string>();
            foreach (var kv in skillKeywords)
            {
                if (textLower.Contains(kv.Key))
                {
                    foundSkills.Add(kv.Value);
                }
            }

            if (foundSkills.Count == 0)
            {
                foundSkills.AddRange(new[] { "Yazılım Geliştirme", "Problem Çözme", "Analitik Düşünme" });
            }

            response.TechnicalSkills = foundSkills.Distinct().ToList();

            if (textLower.Contains("senior") || textLower.Contains("architect") || textLower.Contains("yönetici") || textLower.Contains("lider") || textLower.Contains("lead"))
            {
                response.ExperienceLevel = "Senior-Level";
                response.ScoreExperience = 85;
            }
            else if (textLower.Contains("junior") || textLower.Contains("stajyer") || textLower.Contains("intern") || textLower.Contains("yeni mezun") || textLower.Contains("graduate"))
            {
                response.ExperienceLevel = "Junior-Level";
                response.ScoreExperience = 55;
            }
            else
            {
                response.ExperienceLevel = "Mid-Level";
                response.ScoreExperience = 70;
            }

            response.ScoreTechnical = Math.Min(95, 60 + (response.TechnicalSkills.Count * 4));
            
            int sectionsFound = 0;
            if (textLower.Contains("eğitim") || textLower.Contains("education")) sectionsFound++;
            if (textLower.Contains("deneyim") || textLower.Contains("experience") || textLower.Contains("tecrübe")) sectionsFound++;
            if (textLower.Contains("iletişim") || textLower.Contains("contact") || textLower.Contains("telefon") || textLower.Contains("email")) sectionsFound++;
            if (textLower.Contains("yetenek") || textLower.Contains("skills") || textLower.Contains("beceri")) sectionsFound++;
            if (textLower.Contains("sertifika") || textLower.Contains("certif")) sectionsFound++;

            response.ScoreFormatting = 50 + (sectionsFound * 10);
            response.AtsScore = (int)((response.ScoreTechnical * 0.35) + (response.ScoreExperience * 0.35) + (response.ScoreFormatting * 0.15) + (response.ScoreImpact * 0.15));

            response.Strengths = new List<string>();
            if (response.TechnicalSkills.Count >= 5)
                response.Strengths.Add("Geniş ve güçlü teknik yetenek seti (Tech Stack)");
            if (response.ExperienceLevel == "Senior-Level")
                response.Strengths.Add("Kıdemli rol deneyimi ve teknik liderlik potansiyeli");
            if (sectionsFound >= 4)
                response.Strengths.Add("Düzenli ve iyi yapılandırılmış CV formatı");
            if (response.Strengths.Count == 0)
                response.Strengths.Add("Belirgin teknik odaklılık ve gelişim potansiyeli");

            response.Weaknesses = new List<string>();
            if (!textLower.Contains("docker") && !textLower.Contains("kubernetes") && !textLower.Contains("ci/cd"))
                response.Weaknesses.Add("DevOps ve konteynerizasyon (Docker/Kubernetes) deneyimi eksikliği");
            if (!textLower.Contains("aws") && !textLower.Contains("azure") && !textLower.Contains("cloud") && !textLower.Contains("bulut"))
                response.Weaknesses.Add("Bulut bilişim platformları (AWS, Azure vb.) tecrübesi belirtilmemiş");
            if (response.TechnicalSkills.Count < 4)
                response.Weaknesses.Add("Teknik portföyde derinlemesine araç/kütüphane çeşitliliği az");
            if (response.Weaknesses.Count == 0)
                response.Weaknesses.Add("Proje başarılarının sayısal metriklerle (KPI) desteklenmesi artırılabilir");

            var allStandardSkills = new List<string> { "Docker", "Kubernetes", "AWS", "CI/CD", "Redis", "RabbitMQ", "Microservices", "Unit Testing" };
            response.MissingSkills = allStandardSkills.Where(s => !response.TechnicalSkills.Contains(s)).Take(3).ToList();

            response.JobSuggestions = new List<string>();
            if (response.TechnicalSkills.Contains("C#") || response.TechnicalSkills.Contains(".NET Core"))
            {
                response.JobSuggestions.Add(".NET Backend Developer");
                response.JobSuggestions.Add("Software Engineer");
            }
            if (response.TechnicalSkills.Contains("React") || response.TechnicalSkills.Contains("Angular") || response.TechnicalSkills.Contains("Vue.js") || response.TechnicalSkills.Contains("JavaScript"))
            {
                response.JobSuggestions.Add("Frontend Developer");
            }
            if (response.JobSuggestions.Count >= 2)
            {
                response.JobSuggestions.Add("Full Stack Developer");
            }
            if (response.JobSuggestions.Count == 0)
            {
                response.JobSuggestions.Add("Yazılım Geliştirme Uzmanı");
                response.JobSuggestions.Add("Uygulama Geliştirici");
            }

            response.ImprovementSuggestions = new List<string>
            {
                "Projelerinizde üstlendiğiniz rolleri ve elde ettiğiniz başarıları sayısal (yüzde, süre, bütçe) verilerle destekleyin.",
                "Yeteneklerinizin güncel teknoloji trendleri (Docker, CI/CD, Cloud) ile uyumlu kısımlarını daha belirgin vurgulayın.",
                "CV'nizin en üstüne, kariyer hedeflerinizi ve uzmanlık alanlarınızı özetleyen kısa bir 'Özet/Profil' (Summary) bölümü ekleyin."
            };

            return response;
        }

        private CvAnalysisDto MapToDto(CvAnalysis c)
        {
            return new CvAnalysisDto
            {
                Id = c.Id,
                UserId = c.UserId,
                OriginalFileName = c.OriginalFileName,
                UploadedPdfUrl = c.UploadedPdfUrl,
                AtsScore = c.AtsScore,
                ScoreTechnical = c.ScoreTechnical,
                ScoreExperience = c.ScoreExperience,
                ScoreFormatting = c.ScoreFormatting,
                ScoreImpact = c.ScoreImpact,
                ExperienceLevel = c.ExperienceLevel,
                TechnicalSkills = c.TechnicalSkills ?? new List<string>(),
                MissingSkills = c.MissingSkills ?? new List<string>(),
                Strengths = c.Strengths ?? new List<string>(),
                Weaknesses = c.Weaknesses ?? new List<string>(),
                JobSuggestions = c.JobSuggestions ?? new List<string>(),
                ImprovementSuggestions = c.ImprovementSuggestions ?? new List<string>(),
                CreatedAt = c.CreatedAt
            };
        }
    }

    public class AiCvResponse
    {
        public bool IsCv { get; set; }
        public int AtsScore { get; set; }
        public int ScoreTechnical { get; set; }
        public int ScoreExperience { get; set; }
        public int ScoreFormatting { get; set; }
        public int ScoreImpact { get; set; }
        public string ExperienceLevel { get; set; } = string.Empty;
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> JobSuggestions { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
    }
}