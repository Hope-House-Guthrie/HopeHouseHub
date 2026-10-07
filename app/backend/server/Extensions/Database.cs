using H3.Data.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace H3.Server.Extensions;

public static class Database
{
    public static WebApplicationBuilder AddDatabase(
        this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("HubDb");

        builder.Services.AddDatabase(connectionString);

        return builder;
    }

    public static Task MigrateDatabaseAsync(
        this WebApplication app)
    {
        return app.Services.MigrateDatabaseAsync<Program>();
    }
}