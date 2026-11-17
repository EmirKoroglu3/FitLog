using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
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
public class FitLogDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IDataProtectionKeyContext
{
    /// <summary>ASP.NET Data Protection keys (sign password-reset tokens); stored here so they survive restarts.</summary>
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public FitLogDbContext(DbContextOptions<FitLogDbContext> options) : base(options)
    {
    }

    public DbSet<WorkoutProgram> WorkoutPrograms => Set<WorkoutProgram>();
    public DbSet<WorkoutDay> WorkoutDays => Set<WorkoutDay>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<NutritionLog> NutritionLogs => Set<NutritionLog>();
    public DbSet<Supplement> Supplements => Set<Supplement>();
    public DbSet<AiCoachReport> AiCoachReports => Set<AiCoachReport>();

    // Tracking (what the user actually did)
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<SessionSet> SessionSets => Set<SessionSet>();
    public DbSet<BodyMeasurement> BodyMeasurements => Set<BodyMeasurement>();
    public DbSet<WaterLog> WaterLogs => Set<WaterLog>();
    public DbSet<ProgressPhoto> ProgressPhotos => Set<ProgressPhoto>();
    public DbSet<FitnessGoal> FitnessGoals => Set<FitnessGoal>();
    public DbSet<OneRepMaxRecord> OneRepMaxRecords => Set<OneRepMaxRecord>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<CustomFood> CustomFoods => Set<CustomFood>();
    public DbSet<SupplementIntake> SupplementIntakes => Set<SupplementIntake>();

    /// <summary>Refresh tokens per device (multiple concurrent sessions).</summary>
    public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();

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
        ConfigureTracking(builder);

        builder.Entity<UserRefreshToken>(e =>
        {
            e.ToTable("RefreshTokens");
            e.Property(x => x.TokenHash).IsRequired().HasMaxLength(64);
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => x.UserId);
            e.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureTracking(ModelBuilder builder)
    {
        // Every tracking row belongs to a user and is removed with them.
        void OwnedByUser<T>() where T : class =>
            builder.Entity<T>().HasOne<ApplicationUser>().WithMany()
                .HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkoutSession>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
            e.Property(x => x.Notes).HasMaxLength(1000);
            e.Property(x => x.CardioActivity).HasMaxLength(50);
            e.Property(x => x.DistanceKm).HasPrecision(8, 2);
            e.Property(x => x.SpeedKmh).HasPrecision(5, 2);
            e.Property(x => x.InclinePercent).HasPrecision(5, 2);
            e.HasIndex(x => new { x.UserId, x.StartedAt });
            e.HasMany(x => x.Sets).WithOne(x => x.WorkoutSession)
                .HasForeignKey(x => x.WorkoutSessionId).OnDelete(DeleteBehavior.Cascade);
        });
        OwnedByUser<WorkoutSession>();

        builder.Entity<SessionSet>(e =>
        {
            e.Property(x => x.ExerciseName).IsRequired().HasMaxLength(100);
            e.Property(x => x.WeightKg).HasPrecision(8, 2);
            e.Property(x => x.Rpe).HasPrecision(3, 1);
            e.HasIndex(x => x.ExerciseName);
        });

        builder.Entity<BodyMeasurement>(e =>
        {
            foreach (var prop in new[] { "WeightKg", "BodyFatPercent", "Chest", "Waist", "Hips", "Biceps", "Thigh", "Calf", "Neck" })
                e.Property(prop).HasPrecision(6, 2);
            e.HasIndex(x => new { x.UserId, x.Date });
        });
        OwnedByUser<BodyMeasurement>();

        builder.Entity<WaterLog>(e => e.HasIndex(x => new { x.UserId, x.Date }).IsUnique());
        OwnedByUser<WaterLog>();

        builder.Entity<ProgressPhoto>(e =>
        {
            e.Property(x => x.Pose).HasMaxLength(10);
            e.Property(x => x.Note).HasMaxLength(300);
            e.Property(x => x.ContentType).HasMaxLength(30);
            e.HasIndex(x => new { x.UserId, x.Date });
        });
        OwnedByUser<ProgressPhoto>();

        builder.Entity<FitnessGoal>(e =>
        {
            e.Property(x => x.Title).IsRequired().HasMaxLength(150);
            e.Property(x => x.Category).HasMaxLength(20);
            e.Property(x => x.Unit).HasMaxLength(20);
            e.Property(x => x.TargetValue).HasPrecision(10, 2);
            e.Property(x => x.CurrentValue).HasPrecision(10, 2);
            e.HasIndex(x => x.UserId);
        });
        OwnedByUser<FitnessGoal>();

        builder.Entity<OneRepMaxRecord>(e =>
        {
            e.Property(x => x.ExerciseName).IsRequired().HasMaxLength(100);
            e.Property(x => x.WeightKg).HasPrecision(8, 2);
            e.HasIndex(x => new { x.UserId, x.ExerciseName });
        });
        OwnedByUser<OneRepMaxRecord>();

        builder.Entity<UserSettings>(e =>
        {
            e.HasIndex(x => x.UserId).IsUnique();
            e.Property(x => x.WeightUnit).HasMaxLength(5);
            e.Property(x => x.MeasurementUnit).HasMaxLength(5);
            e.Property(x => x.Language).HasMaxLength(5);
            e.Property(x => x.FavoriteFoodIds).HasMaxLength(4000);
        });
        OwnedByUser<UserSettings>();

        builder.Entity<CustomFood>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
            e.Property(x => x.ServingUnit).HasMaxLength(30);
            foreach (var prop in new[] { "ServingSize", "Calories", "Protein", "Carbohydrates", "Fat" })
                e.Property(prop).HasPrecision(8, 2);
            e.HasIndex(x => x.UserId);
        });
        OwnedByUser<CustomFood>();

        builder.Entity<SupplementIntake>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.SupplementId, x.Date }).IsUnique();
            e.HasOne<Supplement>().WithMany().HasForeignKey(x => x.SupplementId).OnDelete(DeleteBehavior.Cascade);
        });
        OwnedByUser<SupplementIntake>();
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

