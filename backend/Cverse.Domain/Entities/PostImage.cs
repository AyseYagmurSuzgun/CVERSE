using System;

namespace Cverse.Domain.Entities
{
    public class PostImage
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public string ImageUrl { get; set; } = null!;
        
        public Post Post { get; set; } = null!;
    }
}