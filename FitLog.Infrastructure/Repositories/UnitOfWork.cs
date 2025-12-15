using FitLog.Application.Interfaces;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;

namespace FitLog.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementasyonu.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly FitLogDbContext _context;
    private IRepository<User>? _users;
    private IRepository<WorkoutProgram>? _workoutPrograms;
    private IRepository<WorkoutDay>? _workoutDays;
    private IRepository<Exercise>? _exercises;
    private IRepository<NutritionLog>? _nutritionLogs;
    private IRepository<Supplement>? _supplements;

    public UnitOfWork(FitLogDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<WorkoutProgram> WorkoutPrograms => _workoutPrograms ??= new Repository<WorkoutProgram>(_context);
    public IRepository<WorkoutDay> WorkoutDays => _workoutDays ??= new Repository<WorkoutDay>(_context);
    public IRepository<Exercise> Exercises => _exercises ??= new Repository<Exercise>(_context);
    public IRepository<NutritionLog> NutritionLogs => _nutritionLogs ??= new Repository<NutritionLog>(_context);
    public IRepository<Supplement> Supplements => _supplements ??= new Repository<Supplement>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

