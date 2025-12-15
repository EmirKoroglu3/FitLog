using FitLog.Application.DTOs.Workout;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Workout servisi implementasyonu.
/// </summary>
public class WorkoutService : IWorkoutService
{
    private readonly FitLogDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public WorkoutService(FitLogDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    // Workout Programs
    public async Task<List<WorkoutProgramDto>> GetUserWorkoutProgramsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var programs = await _context.WorkoutPrograms
            .Where(p => p.UserId == userId)
            .Include(p => p.WorkoutDays)
                .ThenInclude(d => d.Exercises)
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync(cancellationToken);

        return programs.Select(MapToDto).ToList();
    }

    public async Task<WorkoutProgramDto?> GetWorkoutProgramByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var program = await _context.WorkoutPrograms
            .Include(p => p.WorkoutDays)
                .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return program == null ? null : MapToDto(program);
    }

    public async Task<WorkoutProgramDto> CreateWorkoutProgramAsync(Guid userId, CreateWorkoutProgramRequest request, CancellationToken cancellationToken = default)
    {
        var program = new WorkoutProgram
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description
        };

        await _unitOfWork.WorkoutPrograms.AddAsync(program, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(program);
    }

    public async Task<WorkoutProgramDto?> UpdateWorkoutProgramAsync(Guid id, UpdateWorkoutProgramRequest request, CancellationToken cancellationToken = default)
    {
        var program = await _unitOfWork.WorkoutPrograms.GetByIdAsync(id, cancellationToken);
        if (program == null) return null;

        program.Name = request.Name;
        program.Description = request.Description;

        await _unitOfWork.WorkoutPrograms.UpdateAsync(program, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(program);
    }

    public async Task<bool> DeleteWorkoutProgramAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var program = await _unitOfWork.WorkoutPrograms.GetByIdAsync(id, cancellationToken);
        if (program == null) return false;

        await _unitOfWork.WorkoutPrograms.DeleteAsync(program, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Workout Days
    public async Task<WorkoutDayDto> CreateWorkoutDayAsync(CreateWorkoutDayRequest request, CancellationToken cancellationToken = default)
    {
        var day = new WorkoutDay
        {
            Id = Guid.NewGuid(),
            WorkoutProgramId = request.WorkoutProgramId,
            DayOfWeek = request.DayOfWeek,
            Name = request.Name
        };

        await _unitOfWork.WorkoutDays.AddAsync(day, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDayDto(day);
    }

    public async Task<WorkoutDayDto?> UpdateWorkoutDayAsync(Guid id, UpdateWorkoutDayRequest request, CancellationToken cancellationToken = default)
    {
        var day = await _unitOfWork.WorkoutDays.GetByIdAsync(id, cancellationToken);
        if (day == null) return null;

        day.DayOfWeek = request.DayOfWeek;
        day.Name = request.Name;

        await _unitOfWork.WorkoutDays.UpdateAsync(day, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDayDto(day);
    }

    public async Task<bool> DeleteWorkoutDayAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var day = await _unitOfWork.WorkoutDays.GetByIdAsync(id, cancellationToken);
        if (day == null) return false;

        await _unitOfWork.WorkoutDays.DeleteAsync(day, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Exercises
    public async Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var exercise = new Exercise
        {
            Id = Guid.NewGuid(),
            WorkoutDayId = request.WorkoutDayId,
            Name = request.Name,
            SetCount = request.SetCount,
            Reps = request.Reps,
            Weight = request.Weight,
            Notes = request.Notes
        };

        await _unitOfWork.Exercises.AddAsync(exercise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToExerciseDto(exercise);
    }

    public async Task<ExerciseDto?> UpdateExerciseAsync(Guid id, UpdateExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id, cancellationToken);
        if (exercise == null) return null;

        exercise.Name = request.Name;
        exercise.SetCount = request.SetCount;
        exercise.Reps = request.Reps;
        exercise.Weight = request.Weight;
        exercise.Notes = request.Notes;

        await _unitOfWork.Exercises.UpdateAsync(exercise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToExerciseDto(exercise);
    }

    public async Task<bool> DeleteExerciseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id, cancellationToken);
        if (exercise == null) return false;

        await _unitOfWork.Exercises.DeleteAsync(exercise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Mapping helpers
    private static WorkoutProgramDto MapToDto(WorkoutProgram program) => new()
    {
        Id = program.Id,
        Name = program.Name,
        Description = program.Description,
        CreatedDate = program.CreatedDate,
        WorkoutDays = program.WorkoutDays?.Select(MapToDayDto).ToList() ?? new()
    };

    private static WorkoutDayDto MapToDayDto(WorkoutDay day) => new()
    {
        Id = day.Id,
        DayOfWeek = day.DayOfWeek,
        Name = day.Name,
        Exercises = day.Exercises?.Select(MapToExerciseDto).ToList() ?? new()
    };

    private static ExerciseDto MapToExerciseDto(Exercise exercise) => new()
    {
        Id = exercise.Id,
        Name = exercise.Name,
        SetCount = exercise.SetCount,
        Reps = exercise.Reps,
        Weight = exercise.Weight,
        Notes = exercise.Notes
    };
}

