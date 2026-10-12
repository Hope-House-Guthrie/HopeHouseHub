using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using H3.Data;
using H3.Data.Entities;

namespace H3.Server.Endpoints.VolunteerInquiries;

public static class VolunteerInquiryEndpoints
{
    public const string IndexEndpointName = "IndexVolunteerInquiry";
    public const string GetEndpointName = "GetVolunteerInquiry";
    public const string PatchEndpointName = "PatchVolunteerInquiry";
    public const string DeleteEndpointName = "DeleteVolunteerInquiry";

    public static IEndpointRouteBuilder MapVolunteerInquiries(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/Volunteer-inquiry")
            .WithTags("Volunteer Inquiries")
            .RequireAuthorization(policy => policy.RequireRole("ADMIN"));

        group.MapGet("/", IndexAsync)
            .WithName(IndexEndpointName)
            .WithSummary("Index Volunteer inquiries.")
            .Produces<PagedResult<VolunteerInquiryIndex>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapGet("/{id:guid}", GetAsync)
            .WithName(GetEndpointName)
            .WithSummary("Get a Volunteer inquiry by ID.")
            .Produces<VolunteerInquiry>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPatch("/{id:guid}", PatchAsync)
            .WithName(PatchEndpointName)
            .WithSummary("Patch a Volunteer inquiry by ID.")
            .Produces<VolunteerInquiry>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .WithName(DeleteEndpointName)
            .WithSummary("Delete a Volunteer inquiry by ID.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        return routes;
    }

    private static async Task<IResult> IndexAsync(
        [FromServices] HubDbContext db,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] VolunteerInquirySort sort = VolunteerInquirySort.Timestamp,
        [FromQuery] bool descending = true,
        [FromQuery] bool isArchived = false,
        [FromQuery] string? firstName = null,
        [FromQuery] string? lastName = null,
        [FromQuery] string? email = null,
        [FromQuery] string? phone = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return Results.Problem(
                detail: "Page number must be >= 1 and pageSize must be between 1 and 100.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var query = db.Set<VolunteerInquiry>().AsNoTracking();

        query = query.Where(x => x.IsArchived == isArchived);

        if (!string.IsNullOrWhiteSpace(firstName))
        {
            query = query.Where(x => EF.Functions.ILike(x.FirstName, $"%{firstName}%"));
        }

        if (!string.IsNullOrWhiteSpace(lastName))
        {
            query = query.Where(x => EF.Functions.ILike(x.LastName, $"%{lastName}%"));
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            query = query.Where(x => EF.Functions.ILike(x.Email, $"%{email}%"));
        }

        if (!string.IsNullOrWhiteSpace(phone))
        {
            query = query.Where(x => EF.Functions.ILike(x.Phone, $"%{phone}%"));
        }

        query = (sort, descending) switch
        {
            (VolunteerInquirySort.FirstName, false) => query.OrderBy(x => x.FirstName),
            (VolunteerInquirySort.FirstName, true) => query.OrderByDescending(x => x.FirstName),
            (VolunteerInquirySort.LastName, false) => query.OrderBy(x => x.LastName),
            (VolunteerInquirySort.LastName, true) => query.OrderByDescending(x => x.LastName),
            (VolunteerInquirySort.Timestamp, false) => query.OrderBy(x => x.Timestamp),
            (VolunteerInquirySort.Timestamp, true) => query.OrderByDescending(x => x.Timestamp),
            _ => query
        };

        var count = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new VolunteerInquiryIndex(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Phone,
                x.Email,
                x.Timestamp,
                x.IsArchived
            ))
            .ToListAsync(cancellationToken);

        var result = new PagedResult<VolunteerInquiryIndex>(items, count, page, pageSize);

        return Results.Ok(result);
    }

    private static async Task<IResult> GetAsync(
        [FromRoute] Guid id,
        [FromServices] HubDbContext db,
        CancellationToken cancellationToken)
    {
        var inquiry = await db.Set<VolunteerInquiry>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return inquiry is not null
            ? Results.Ok(inquiry)
            : Results.NotFound();
    }

    private static async Task<IResult> PatchAsync(
        [FromRoute] Guid id,
        [FromBody] VolunteerInquiryPatch request,
        [FromServices] HubDbContext db,
        CancellationToken cancellationToken)
    {
        var rowsAffected = await db.Set<VolunteerInquiry>()
            .Where(x => x.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsArchived, request.IsArchived), cancellationToken);

        return rowsAffected > 0 
            ? Results.Ok() 
            : Results.NotFound();
    }

    private static async Task<IResult> DeleteAsync(
        [FromRoute] Guid id,
        [FromServices] HubDbContext db,
        CancellationToken cancellationToken)
    {
        var rowsAffected = await db.Set<VolunteerInquiry>()
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken);

        return rowsAffected > 0 
            ? Results.NoContent() 
            : Results.NotFound();
    }
}