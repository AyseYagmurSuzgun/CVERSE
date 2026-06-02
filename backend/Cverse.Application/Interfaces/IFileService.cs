using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Cverse.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder = "posts");
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}