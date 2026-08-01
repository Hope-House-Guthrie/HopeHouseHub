using Microsoft.EntityFrameworkCore;
using H3.Data.Entities;
using H3.Data.Entities.Configuration;
using Microsoft.EntityFrameworkCore.Migrations;

namespace H3.Data;

public class HubDbContext
    : DbContext
{
    public DbSet<Client> Clients => Set<Client>();

    public HubDbContext(DbContextOptions options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new ClientConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
    }
}