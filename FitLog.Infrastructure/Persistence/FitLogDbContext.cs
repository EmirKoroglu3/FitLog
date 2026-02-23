using FitLog.Domain.Entities;
using FitLog.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Persistence;

/// <summary>
/// FitLog veritabanı context sınıfı.
/// Identity ve entity'leri yönetir.
/// </summary>
public class FitLogDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public FitLogDbContext(DbContextOptions<FitLogDbContext> options) : base(options)
    {
    }

    public DbSet<WorkoutProgram> WorkoutPrograms => Set<WorkoutProgram>();
    public DbSet<WorkoutDay> WorkoutDays => Set<WorkoutDay>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<NutritionLog> NutritionLogs => Set<NutritionLog>();
    public DbSet<Supplement> Supplements => Set<Supplement>();
    public DbSet<AiCoachReport> AiCoachReports => Set<AiCoachReport>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Identity tablo isimlerini özelleştir
        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // WorkoutProgram configuration
        builder.Entity<WorkoutProgram>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasMany(e => e.WorkoutDays)
                  .WithOne(e => e.WorkoutProgram)
                  .HasForeignKey(e => e.WorkoutProgramId)
                  .OnDelete(DeleteBehavior.Cascade);
            // UserId foreign key'i Users (ApplicationUser) tablosuna yönlendir
            entity.HasOne<ApplicationUser>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Ignore(e => e.User); // Domain User entity'sini ignore et
        });

        // WorkoutDay configuration
        builder.Entity<WorkoutDay>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.HasMany(e => e.Exercises)
                  .WithOne(e => e.WorkoutDay)
                  .HasForeignKey(e => e.WorkoutDayId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Exercise configuration
        builder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Weight).HasPrecision(10, 2);
            entity.Property(e => e.Notes).HasMaxLength(500);
        });

        // NutritionLog configuration
        builder.Entity<NutritionLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Protein).HasPrecision(10, 2);
            entity.Property(e => e.Carbohydrates).HasPrecision(10, 2);
            entity.Property(e => e.Fat).HasPrecision(10, 2);
            entity.Property(e => e.MealType).HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasIndex(e => new { e.UserId, e.Date });
            // UserId foreign key'i Users (ApplicationUser) tablosuna yönlendir
            entity.HasOne<ApplicationUser>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Ignore(e => e.User); // Domain User entity'sini ignore et
        });

        // Supplement configuration
        builder.Entity<Supplement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UsageNote).HasMaxLength(500);
            entity.Property(e => e.Dosage).HasMaxLength(100);
            entity.Property(e => e.Timing).HasMaxLength(100);
            // UserId foreign key'i Users (ApplicationUser) tablosuna yönlendir
            entity.HasOne<ApplicationUser>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Ignore(e => e.User); // Domain User entity'sini ignore et
        });

        // AiCoachReport configuration
        builder.Entity<AiCoachReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TrainingSummary).HasMaxLength(4000);
            entity.Property(e => e.NutritionSummary).HasMaxLength(2000);
            entity.Property(e => e.AiRecommendationText).HasMaxLength(8000);
            entity.Property(e => e.CalculatedVolumeJson).HasMaxLength(8000);
            entity.HasIndex(e => e.UserId);
            entity.HasOne<ApplicationUser>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedDate = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedDate = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

