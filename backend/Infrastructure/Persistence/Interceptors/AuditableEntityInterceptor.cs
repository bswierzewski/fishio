using Fishio.Application.Common.Interfaces;
using Fishio.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeProvider _dateTime;

    public AuditableEntityInterceptor(
        IServiceProvider serviceProvider,
        TimeProvider dateTime)
    {
        _serviceProvider = serviceProvider;
        _dateTime = dateTime;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        // Rozwiązujemy IUserService dynamicznie wewnątrz metody, używając scope'u
        using (var scope = _serviceProvider.CreateScope())
        {
            var user = scope.ServiceProvider.GetService<ICurrentUserService>();
            var utcNow = _dateTime.GetUtcNow();

            foreach (var entry in context.ChangeTracker.Entries<BaseAuditableEntity>())
            {
                if (entry.State is EntityState.Added or EntityState.Modified || entry.HasChangedOwnedEntities())
                {
                    if (entry.State == EntityState.Added)
                    {
                        entry.Entity.CreatedBy = user?.UserId;
                        entry.Entity.Created = utcNow;
                    }
                    entry.Entity.LastModifiedBy = user?.UserId;
                    entry.Entity.LastModified = utcNow;
                }
            }
        }
    }
}

public static class Extensions
{
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r =>
            r.TargetEntry != null &&
            r.TargetEntry.Metadata.IsOwned() &&
            (r.TargetEntry.State == EntityState.Added || r.TargetEntry.State == EntityState.Modified));
}
