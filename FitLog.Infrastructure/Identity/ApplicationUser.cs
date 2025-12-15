using Microsoft.AspNetCore.Identity;

namespace FitLog.Infrastructure.Identity;

/// <summary>
/// ASP.NET Identity kullanıcı sınıfı.
/// Domain'deki User entity'si ile ilişkilidir.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    // Profil Bilgileri
    public decimal? Height { get; set; } // Boy (cm)
    public decimal? Weight { get; set; } // Kilo (kg)
    public string? Gender { get; set; } // Cinsiyet: "Erkek", "Kadın", "Diğer"
    public DateTime? BirthDate { get; set; } // Doğum tarihi
    public string? FitnessGoal { get; set; } // Hedef: "Kas Yapma", "Kilo Verme", "Güç Artırma", "Genel Sağlık"
    public string? ExperienceLevel { get; set; } // Seviye: "Başlangıç", "Orta", "İleri"
}

