using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace H3.Data.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services,
        string? connectionString)
    {
        services.AddDbContext<HubDbContext>(
            options => options.AddOptions(connectionString));

        return services;
    }

    public async static Task MigrateDatabaseAsync<TCategoryName>(
        this IServiceProvider provider)
    {
        using var scope = provider.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TCategoryName>>();
        var db = scope.ServiceProvider.GetRequiredService<HubDbContext>();

        try
        {
            logger.LogInformation("Checking for pending EF Core database migrations...");
            
            await db.Database.MigrateAsync();
            
            logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "An error occurred while migrating the database.");
            throw;
        }
    }

    internal static DbContextOptionsBuilder AddOptions(
        this DbContextOptionsBuilder builder,
        string? connectionString = null)
    {
        connectionString ??= BuildConnectionStringFromPostgresEnvVars()
            ?? "invalid connection string"; // this occurs when building openapi.json

        return builder
            .UseNpgsql(connectionString);
    }

    private static string? BuildConnectionStringFromPostgresEnvVars()
    {
        static string? env(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);

            if (string.IsNullOrWhiteSpace(value))
                return null;

            return value;
        }

        var host = env("PGHOST");
        var database = env("PGDATABASE");
        var user = env("PGUSER");
        var port = env("PGPORT");

        if (host == null || database == null || user == null || port == null)
            return null;

        return $"Host={host};Database={database};Username={user};Port={port}";
    }
}