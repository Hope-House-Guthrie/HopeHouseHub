using H3.Data;
using H3.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace H3.Endpoints;

public record ClientDto(
    int ID, 
    string FirstName, 
    string? MiddleName, 
    string LastName, 
    bool IsActive);

public static class ClientExtensions
{
    public static WebApplication MapClientEndpoints(
        this WebApplication app)
    {
        const string endpoint = "api/client";

        var api = app.MapGroup($"/{endpoint}");

        api.MapGet("/", async (HubDbContext db) =>
        {
            var clients = await db.Clients
                .Select(c => new ClientDto(
                    c.Id,
                    c.FirstName,
                    c.MiddleName,
                    c.LastName,
                    c.IsActive))
                .ToListAsync();

            return Results.Ok(clients);
        });

        api.MapPost("/", async (ClientDto dto, HubDbContext db) =>
        {
            var entity = new Client
            {
                FirstName = dto.FirstName,
                MiddleName = dto.MiddleName,
                LastName = dto.LastName,
                CreateDate = DateTime.UtcNow,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            db.Clients.Add(entity);
            await db.SaveChangesAsync();

            return Results.Created(
                $"/{endpoint}/{entity.Id}", 
                new ClientDto(
                    ID: entity.Id,
                    FirstName: entity.FirstName, 
                    MiddleName: entity.MiddleName, 
                    LastName: entity.LastName, 
                    IsActive: entity.IsActive));
        });

        api.MapGet("/{id:int}", async (int id, HubDbContext db) =>
        {
            var client = await db.Clients
                .Where(c => c.Id == id)
                .Select(c => new ClientDto(
                    c.Id,
                    c.FirstName,
                    c.MiddleName,
                    c.LastName,
                    c.IsActive))
                .FirstOrDefaultAsync();

            return client is not null 
                ? Results.Ok(client) 
                : Results.NotFound();
        });

        api.MapPut("/{id:int}", async (int id, ClientDto dto, HubDbContext db) =>
        {
            var entity = await db.Clients.FindAsync(id);
            if (entity is null || entity.IsDeleted)
            {
                return Results.NotFound();
            }

            entity.FirstName = dto.FirstName;
            entity.MiddleName = dto.MiddleName;
            entity.LastName = dto.LastName;
            entity.IsActive = dto.IsActive;
            entity.UpdateDate = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        api.MapDelete("/{id:int}", async (int id, HubDbContext db) =>
        {
            var entity = await db.Clients.FindAsync(id);
            if (entity is null || entity.IsDeleted)
            {
                return Results.NotFound();
            }

            entity.IsDeleted = true;
            entity.UpdateDate = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        return app;
    }
}