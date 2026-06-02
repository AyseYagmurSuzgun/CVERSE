using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Cverse.Application.Interfaces;

namespace Cverse.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;

        public FileService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "posts")
        {
            // Cloudinary yapısı kurulana kadar Local fallback kullanılır.
            // Cloudinary eklendiğinde sadece buradaki stream mantığı Cloudinary API'sine çevrilir,
            // tüm sistem kusursuz çalışmaya devam eder.
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", folder);
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return $"/uploads/{folder}/{fileName}";
        }

        public Task<bool> DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return Task.FromResult(false);

            try
            {
                var relativePath = imageUrl.TrimStart('/');
                var absolutePath = Path.Combine(_env.ContentRootPath, relativePath);

                if (File.Exists(absolutePath))
                {
                    File.Delete(absolutePath);
                    return Task.FromResult(true);
                }
            }
            catch
            {
                return Task.FromResult(false);
            }

            return Task.FromResult(false);
        }
    }
}