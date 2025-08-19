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
        throw new NotSupportedException("Synchroniczne operacje SaveChanges nie są obsługiwane. Użyj SaveChangesAsync.");
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        await UpdateEntitiesAsync(eventData.Context, cancellationToken);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private async Task UpdateEntitiesAsync(DbContext? context, CancellationToken cancellationToken = default)
    {
        if (context == null) return;

        using (var scope = _serviceProvider.CreateScope())
        {
            var user = scope.ServiceProvider.GetService<ICurrentUserService>();
            var utcNow = _dateTime.GetUtcNow();
            var userId = user != null ? await user.GetUserIdAsync(cancellationToken) : null;

            foreach (var entry in context.ChangeTracker.Entries().Where(e => e.Entity is IAuditableEntity))
            {
                if (entry.State is EntityState.Added or EntityState.Modified || entry.HasChangedOwnedEntities())
                {
                    var auditableEntity = (IAuditableEntity)entry.Entity;
                    
                    if (entry.State == EntityState.Added)
                    {
                        auditableEntity.CreatedBy = userId;
                        auditableEntity.Created = utcNow;
                    }
                    auditableEntity.LastModifiedBy = userId;
                    auditableEntity.LastModified = utcNow;
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
