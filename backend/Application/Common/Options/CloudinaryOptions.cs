using System.ComponentModel.DataAnnotations;

namespace Application.Common.Options
{
    public class CloudinaryOptions
    {
        public const string SectionName = "Cloudinary";

        [Required]
        public string? CloudName { get; set; }

        [Required]
        public string? ApiKey { get; set; }

        [Required]
        public string? ApiSecret { get; set; }
    }
}