using Microsoft.EntityFrameworkCore;
using Fishio.Domain.Entities;

namespace Fishio.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}