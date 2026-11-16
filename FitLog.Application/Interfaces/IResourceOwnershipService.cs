namespace FitLog.Application.Interfaces;

/// <summary>
/// Answers "does this row belong to this user?" for resources addressed by id.
/// Controllers call it before reading/changing a row so one user can't touch another's data (IDOR).
/// </summary>
public interface IResourceOwnershipService
{
    Task<bool> OwnsProgramAsync(Guid userId, Guid programId, CancellationToken ct = default);
    Task<bool> OwnsDayAsync(Guid userId, Guid dayId, CancellationToken ct = default);
    Task<bool> OwnsExerciseAsync(Guid userId, Guid exerciseId, CancellationToken ct = default);
    Task<bool> OwnsNutritionLogAsync(Guid userId, Guid logId, CancellationToken ct = default);
    Task<bool> OwnsSupplementAsync(Guid userId, Guid supplementId, CancellationToken ct = default);
}
