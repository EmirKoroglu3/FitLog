using FitLog.Application.DTOs.Supplement;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Supplement servisi implementasyonu.
/// </summary>
public class SupplementService : ISupplementService
{
    private readonly FitLogDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public SupplementService(FitLogDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SupplementDto>> GetUserSupplementsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var supplements = await _context.Supplements
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return supplements.Select(MapToDto).ToList();
    }

    public async Task<SupplementDto?> GetSupplementByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplement = await _unitOfWork.Supplements.GetByIdAsync(id, cancellationToken);
        return supplement == null ? null : MapToDto(supplement);
    }

    public async Task<SupplementDto> CreateSupplementAsync(Guid userId, CreateSupplementRequest request, CancellationToken cancellationToken = default)
    {
        var supplement = new Supplement
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            UsageNote = request.UsageNote,
            Dosage = request.Dosage,
            Timing = request.Timing
        };

        await _unitOfWork.Supplements.AddAsync(supplement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(supplement);
    }

    public async Task<SupplementDto?> UpdateSupplementAsync(Guid id, UpdateSupplementRequest request, CancellationToken cancellationToken = default)
    {
        var supplement = await _unitOfWork.Supplements.GetByIdAsync(id, cancellationToken);
        if (supplement == null) return null;

        supplement.Name = request.Name;
        supplement.UsageNote = request.UsageNote;
        supplement.Dosage = request.Dosage;
        supplement.Timing = request.Timing;

        await _unitOfWork.Supplements.UpdateAsync(supplement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(supplement);
    }

    public async Task<bool> DeleteSupplementAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplement = await _unitOfWork.Supplements.GetByIdAsync(id, cancellationToken);
        if (supplement == null) return false;

        await _unitOfWork.Supplements.DeleteAsync(supplement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static SupplementDto MapToDto(Supplement supplement) => new()
    {
        Id = supplement.Id,
        Name = supplement.Name,
        UsageNote = supplement.UsageNote,
        Dosage = supplement.Dosage,
        Timing = supplement.Timing
    };
}

