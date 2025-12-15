using FitLog.Domain.Entities;

namespace FitLog.Application.Interfaces;

/// <summary>
/// Unit of Work pattern interface.
/// Tüm repository'leri tek bir transaction altında yönetir.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<WorkoutProgram> WorkoutPrograms { get; }
    IRepository<WorkoutDay> WorkoutDays { get; }
    IRepository<Exercise> Exercises { get; }
    IRepository<NutritionLog> NutritionLogs { get; }
    IRepository<Supplement> Supplements { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

