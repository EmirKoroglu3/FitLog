using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace FitLog.Application;

/// <summary>
/// Application katmanı Dependency Injection kayıtları.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // FluentValidation - Assembly'deki tüm validator'ları otomatik kaydet
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}

