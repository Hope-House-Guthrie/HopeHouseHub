using Microsoft.EntityFrameworkCore;

namespace H3.Data;

public static class WebApplicationBuilderExtensions
{
    public static WebApplicationBuilder AddDatabase(
        this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("HubDb");

        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = BuildConnectionStringFromPostgresEnvVars();
        }

        builder.Services.AddDbContext<HubDbContext>(options =>
            options.UseNpgsql(connectionString));

        return builder;
    }

    public async static Task MigrateDatabaseAsync(
        this WebApplication app)
    {
        
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
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

    private static string BuildConnectionStringFromPostgresEnvVars()
    {
        string env(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);

            if (string.IsNullOrWhiteSpace(value))
                throw new ApplicationException($"Missing or empty ${name} environment variable");

            return value;
        }

        var host = env("PGHOST");
        var database = env("PGDATABASE");
        var user = env("PGUSER");
        var port = env("PGPORT");

        return $"Host={host};Database={database};Username={user};Port={port}";
    }
}