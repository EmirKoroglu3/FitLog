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
        // New exercises go to the end of the day
        var nextOrder = await _context.Exercises
            .Where(e => e.WorkoutDayId == request.WorkoutDayId)
            .Select(e => (int?)e.Order)
            .MaxAsync(cancellationToken) is { } max ? max + 1 : 0;

        var exercise = new Exercise
        {
            Id = Guid.NewGuid(),
            WorkoutDayId = request.WorkoutDayId,
            Name = request.Name,
            SetCount = request.SetCount,
            Reps = request.Reps,
            Weight = request.Weight,
            Notes = request.Notes,
            Order = nextOrder
        };

        await _unitOfWork.Exercises.AddAsync(exercise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToExerciseDto(exercise);
    }

    public async Task<ExerciseDto?> UpdateExerciseAsync(Guid id, UpdateExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var exercise = await _unitOfWork.Exercises.GetByIdAsync(id, cancellationToken);
        if (exercise == null) return null;

        // Older clients sent updates without a name; never blank an exercise out
        if (!string.IsNullOrWhiteSpace(request.Name))
            exercise.Name = request.Name.Trim();
        exercise.SetCount = request.SetCount;
        exercise.Reps = request.Reps;
        exercise.Weight = request.Weight;
        // Partial updates (e.g. the inline set/rep edit) must not wipe the note or superset link
        if (request.Notes != null)
            exercise.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        if (request.SupersetWithNext.HasValue)
            exercise.SupersetWithNext = request.SupersetWithNext.Value;

        await _unitOfWork.Exercises.UpdateAsync(exercise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToExerciseDto(exercise);
    }

    public async Task<List<ExerciseDto>?> ReorderExercisesAsync(Guid dayId, IReadOnlyList<Guid> exerciseIds, CancellationToken cancellationToken = default)
    {
        var exercises = await _context.Exercises.Where(e => e.WorkoutDayId == dayId).ToListAsync(cancellationToken);

        // The list must contain exactly this day's exercises, each once
        if (exerciseIds.Count != exercises.Count || exerciseIds.Distinct().Count() != exerciseIds.Count
            || !exercises.All(e => exerciseIds.Contains(e.Id)))
            return null;

        for (var i = 0; i < exerciseIds.Count; i++)
            exercises.First(e => e.Id == exerciseIds[i]).Order = i;

        await _context.SaveChangesAsync(cancellationToken);
        return exercises.OrderBy(e => e.Order).Select(MapToExerciseDto).ToList();
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
        Exercises = day.Exercises?.OrderBy(e => e.Order).ThenBy(e => e.CreatedDate).Select(MapToExerciseDto).ToList() ?? new()
    };

    private static ExerciseDto MapToExerciseDto(Exercise exercise) => new()
    {
        Id = exercise.Id,
        Name = exercise.Name,
        SetCount = exercise.SetCount,
        Reps = exercise.Reps,
        Weight = exercise.Weight,
        Notes = exercise.Notes,
        Order = exercise.Order,
        SupersetWithNext = exercise.SupersetWithNext
    };
}

