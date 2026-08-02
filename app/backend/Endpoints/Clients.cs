using H3.Data;
using H3.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace H3.Endpoints;

public record ClientResource(
    string? ID, 
    string FirstName, 
    string? MiddleName, 
    string LastName, 
    bool IsActive);

public static class ClientExtensions
{
    public static WebApplication MapClientEndpoints(this WebApplication app)
    {
        const string endpoint = "api/client";

        var api = app.MapGroup($"/{endpoint}")
            .WithTags("Clients")
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        api.MapGet("/", IndexAsync)
            .WithName("IndexClients")
            .WithSummary("Retrieve all active clients")
            .WithDescription("Fetches a list of all non-deleted clients.");

        api.MapPost("/", CreateAsync)
            .WithName("CreateClient")
            .WithSummary("Create a new client")
            .ProducesValidationProblem();

        api.MapGet("/{id}", GetAsync)
            .WithName("GetClientById")
            .WithSummary("Get a client by ID");

        api.MapPut("/{id}", UpdateAsync)
            .WithName("UpdateClient")
            .WithSummary("Update an existing client")
            .ProducesValidationProblem();

        api.MapDelete("/{id}", DeleteAsync)
            .WithName("DeleteClient")
            .WithSummary("Delete a client");

        return app;
    }

    private static async Task<Ok<List<ClientResource>>> IndexAsync(HubDbContext db)
    {
        var clients = await db.Clients
            .Where(c => !c.IsDeleted)
            .Select(c => new ClientResource(
                c.Id.ToString(),
                c.FirstName,
                c.MiddleName,
                c.LastName,
                c.IsActive))
            .ToListAsync();

        return TypedResults.Ok(clients);
    }

    private static async Task<Results<CreatedAtRoute<ClientResource>, ValidationProblem>> CreateAsync(
        ClientResource resource, 
        HubDbContext db)
    {
        if (string.IsNullOrWhiteSpace(resource.FirstName) || string.IsNullOrWhiteSpace(resource.LastName))
        {
            var errors = new Dictionary<string, string[]>();

            if (string.IsNullOrWhiteSpace(resource.FirstName)) 
                errors.Add(nameof(resource.FirstName), ["First name is required."]);

            if (string.IsNullOrWhiteSpace(resource.LastName)) 
                errors.Add(nameof(resource.LastName), ["Last name is required."]);

            return TypedResults.ValidationProblem(errors);
        }

        var entity = new Client
        {
            FirstName = resource.FirstName,
            MiddleName = resource.MiddleName,
            LastName = resource.LastName,
            CreateDate = DateTime.UtcNow,
            IsActive = resource.IsActive,
            IsDeleted = false
        };

        db.Clients.Add(entity);

        await db.SaveChangesAsync();

        var result = new ClientResource(
            ID: entity.Id.ToString(),
            FirstName: entity.FirstName,
            MiddleName: entity.MiddleName,
            LastName: entity.LastName,
            IsActive: entity.IsActive);

        return TypedResults.CreatedAtRoute(
            routeName: "GetClientById",
            routeValues: new { id = entity.Id },
            value: result);
    }

    private static async Task<Results<Ok<ClientResource>, NotFound>> GetAsync(
        string id, 
        HubDbContext db)
    {
        var client = await db.Clients
            .Where(c => c.Id.ToString() == id && !c.IsDeleted)
            .Select(c => new ClientResource(
                c.Id.ToString(),
                c.FirstName,
                c.MiddleName,
                c.LastName,
                c.IsActive))
            .FirstOrDefaultAsync();

        return client is not null 
            ? TypedResults.Ok(client) 
            : TypedResults.NotFound();
    }

    private static async Task<Results<NoContent, NotFound, ValidationProblem>> UpdateAsync(
        string id, 
        ClientResource resource, 
        HubDbContext db)
    {
        if (string.IsNullOrWhiteSpace(resource.FirstName) || string.IsNullOrWhiteSpace(resource.LastName))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(resource.FirstName), ["First name is required."] }
            });
        }

        var entity = await db.Clients.FirstOrDefaultAsync(x => x.Id.ToString() == id);
        if (entity is null || entity.IsDeleted)
        {
            return TypedResults.NotFound();
        }

        entity.FirstName = resource.FirstName;
        entity.MiddleName = resource.MiddleName;
        entity.LastName = resource.LastName;
        entity.IsActive = resource.IsActive;
        entity.UpdateDate = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        string id, 
        HubDbContext db)
    {
        var entity = await db.Clients.FirstOrDefaultAsync(x => x.Id.ToString() == id);
        if (entity is null || entity.IsDeleted)
        {
            return TypedResults.NotFound();
        }

        entity.IsDeleted = true;
        entity.UpdateDate = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}