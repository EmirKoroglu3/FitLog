using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services.Tracking;

public class BodyTrackingService : IBodyTrackingService
{
    private static readonly HashSet<string> AllowedImageTypes = new() { "image/jpeg", "image/png", "image/webp" };
    private const int MaxImageBytes = 1_200_000;

    private readonly FitLogDbContext _db;

    public BodyTrackingService(FitLogDbContext db) => _db = db;

    // ---- Measurements ----

    public async Task<List<BodyMeasurementDto>> GetMeasurementsAsync(Guid userId, CancellationToken ct = default)
    {
        var rows = await _db.BodyMeasurements.AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Date).ThenByDescending(m => m.CreatedDate)
            .ToListAsync(ct);
        return rows.Select(Map).ToList();
    }

    public async Task<BodyMeasurementDto> CreateMeasurementAsync(Guid userId, SaveBodyMeasurementRequest request, CancellationToken ct = default)
    {
        var entity = new BodyMeasurement { Id = Guid.NewGuid(), UserId = userId };
        Apply(entity, request);
        _db.BodyMeasurements.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Map(entity);
    }

    public async Task<BodyMeasurementDto?> UpdateMeasurementAsync(Guid userId, Guid id, SaveBodyMeasurementRequest request, CancellationToken ct = default)
    {
        var entity = await _db.BodyMeasurements.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId, ct);
        if (entity == null) return null;
        Apply(entity, request);
        await _db.SaveChangesAsync(ct);
        return Map(entity);
    }

    public async Task<bool> DeleteMeasurementAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.BodyMeasurements.Where(m => m.Id == id && m.UserId == userId).ExecuteDeleteAsync(ct) > 0;

    // ---- Water ----

    public Task<List<WaterLogDto>> GetWaterLogsAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default) =>
        _db.WaterLogs.AsNoTracking()
            .Where(w => w.UserId == userId && w.Date >= from && w.Date <= to)
            .OrderBy(w => w.Date)
            .Select(w => new WaterLogDto { Date = w.Date, Glasses = w.Glasses })
            .ToListAsync(ct);

    public async Task<WaterLogDto> SetWaterAsync(Guid userId, DateOnly date, int glasses, CancellationToken ct = default)
    {
        var log = await _db.WaterLogs.FirstOrDefaultAsync(w => w.UserId == userId && w.Date == date, ct);
        if (log == null)
        {
            log = new WaterLog { Id = Guid.NewGuid(), UserId = userId, Date = date };
            _db.WaterLogs.Add(log);
        }
        log.Glasses = glasses;
        await _db.SaveChangesAsync(ct);
        return new WaterLogDto { Date = log.Date, Glasses = log.Glasses };
    }

    // ---- Photos ----

    public Task<List<ProgressPhotoDto>> GetPhotosAsync(Guid userId, CancellationToken ct = default) =>
        _db.ProgressPhotos.AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Date).ThenByDescending(p => p.CreatedDate)
            .Select(p => new ProgressPhotoDto { Id = p.Id, Date = p.Date, Pose = p.Pose, Note = p.Note })
            .ToListAsync(ct);

    public async Task<(byte[] Data, string ContentType)?> GetPhotoImageAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var photo = await _db.ProgressPhotos.AsNoTracking()
            .Where(p => p.Id == id && p.UserId == userId)
            .Select(p => new { p.ImageData, p.ContentType })
            .FirstOrDefaultAsync(ct);
        return photo == null ? null : (photo.ImageData, photo.ContentType);
    }

    public async Task<ProgressPhotoDto> UploadPhotoAsync(Guid userId, UploadProgressPhotoRequest request, CancellationToken ct = default)
    {
        var (bytes, contentType) = ParseDataUrl(request.DataUrl);
        var photo = new ProgressPhoto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Pose = request.Pose,
            Note = request.Note,
            ContentType = contentType,
            ImageData = bytes,
        };
        _db.ProgressPhotos.Add(photo);
        await _db.SaveChangesAsync(ct);
        return new ProgressPhotoDto { Id = photo.Id, Date = photo.Date, Pose = photo.Pose, Note = photo.Note };
    }

    public async Task<bool> DeletePhotoAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.ProgressPhotos.Where(p => p.Id == id && p.UserId == userId).ExecuteDeleteAsync(ct) > 0;

    // ------------------------------------------------------------------

    /// <summary>Parses "data:image/jpeg;base64,...", validating type, size and the file signature.</summary>
    internal static (byte[] Bytes, string ContentType) ParseDataUrl(string dataUrl)
    {
        const string prefix = "data:";
        var comma = dataUrl.IndexOf(',');
        if (!dataUrl.StartsWith(prefix, StringComparison.Ordinal) || comma < 0)
            throw new ArgumentException("Geçersiz görsel verisi.");

        var meta = dataUrl[prefix.Length..comma]; // image/jpeg;base64
        var parts = meta.Split(';');
        var contentType = parts[0].ToLowerInvariant();
        if (!AllowedImageTypes.Contains(contentType) || !parts.Contains("base64"))
            throw new ArgumentException("Sadece JPEG, PNG veya WebP yüklenebilir.");

        byte[] bytes;
        try { bytes = Convert.FromBase64String(dataUrl[(comma + 1)..]); }
        catch (FormatException) { throw new ArgumentException("Geçersiz görsel verisi."); }

        if (bytes.Length == 0 || bytes.Length > MaxImageBytes)
            throw new ArgumentException("Görsel en fazla 1,2 MB olabilir.");

        var signatureOk = contentType switch
        {
            "image/jpeg" => bytes.Length > 3 && bytes[0] == 0xFF && bytes[1] == 0xD8,
            "image/png" => bytes.Length > 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47,
            "image/webp" => bytes.Length > 12 && bytes[8] == (byte)'W' && bytes[9] == (byte)'E' && bytes[10] == (byte)'B' && bytes[11] == (byte)'P',
            _ => false,
        };
        if (!signatureOk) throw new ArgumentException("Dosya içeriği belirtilen görsel türüyle uyuşmuyor.");

        return (bytes, contentType);
    }

    private static void Apply(BodyMeasurement e, SaveBodyMeasurementRequest r)
    {
        e.Date = r.Date;
        e.WeightKg = r.WeightKg;
        e.BodyFatPercent = r.BodyFatPercent;
        e.Chest = r.Chest;
        e.Waist = r.Waist;
        e.Hips = r.Hips;
        e.Biceps = r.Biceps;
        e.Thigh = r.Thigh;
        e.Calf = r.Calf;
        e.Neck = r.Neck;
    }

    private static BodyMeasurementDto Map(BodyMeasurement e) => new()
    {
        Id = e.Id,
        Date = e.Date,
        WeightKg = e.WeightKg,
        BodyFatPercent = e.BodyFatPercent,
        Chest = e.Chest,
        Waist = e.Waist,
        Hips = e.Hips,
        Biceps = e.Biceps,
        Thigh = e.Thigh,
        Calf = e.Calf,
        Neck = e.Neck,
    };
}
