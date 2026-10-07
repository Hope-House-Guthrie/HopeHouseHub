using Microsoft.EntityFrameworkCore;
using H3.Data.Entities;
using H3.Data.Entities.Configuration;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace H3.Data;

public class HubDbContext(DbContextOptions<HubDbContext> options)
    : IdentityDbContext<User, Role, int, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>(options)
{
    public DbSet<Kennyism> Kennyisms => Set<Kennyism>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Meal> Meals => Set<Meal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new RoleClaimConfiguration());
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new UserClaimConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new UserLoginConfiguration());
        modelBuilder.ApplyConfiguration(new UserRoleConfiguration());
        modelBuilder.ApplyConfiguration(new UserTokenConfiguration());

        modelBuilder.ApplyConfiguration(new KennyismConfiguration());
        modelBuilder.ApplyConfiguration(new MenuItemConfiguration());
        modelBuilder.ApplyConfiguration(new MealConfiguration());
    }
}