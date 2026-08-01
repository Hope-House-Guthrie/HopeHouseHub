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