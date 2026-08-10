        using He.Data;
        using H3.Data.Entities;
        using Microsoft.AspNetCore.Http.HttpResults;
        using Microsoft.EntityFrameworkCore;

        namespace H3.Endpoints;

        public class HubDbContext
        : DbContext
        {
        public DbSet<Client> Clients => Set<Client>();

        // ADD THIS LINE:
        public DbSet<MaintenanceTicket> MaintenanceTickets => Set<MaintenanceTicket>();

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

        /// <summary>
        /// Priority levels for maintenance requests
        /// </summary>
        public enum MaintenancePriority
        {
        Low = 1,        // Minor issue, can wait
        Medium = 2,     // Needs attention soon
        High = 3,       // Urgent, affects functionality
        Emergency = 4   // Safety hazard or complete failure
        }

        /// <summary>
        /// Status tracking for maintenance tickets
        /// </summary>
        public enum MaintenanceStatus
        {
        Open = 1,       // New ticket, not yet assigned
        InProgress = 2, // Mike is working on it
        Resolved = 3,   // Fixed and verified
        Closed = 4      // Mike signed off as complete
        }

        ///<summary>
        /// Request DTO for creating a new maintance ticket
        /// Sent from frontend submission
        /// </summary>
        public record MaintenanceCreateRequest(
            string SubmitterName,
            string Location,
            string Description,
            string? PartsNeeded,
            MaintenancePriority Priority = MaintenancePriority.Medium
        );

        ///<summary>
        /// Responce DTO returned from API calls
        /// Combines entity data with additional computed fields
        /// </summary>
        /public record MaintenanceTicketResource(
            int Id,
            string SubmitterName,
            string Location,
            string Description,
            string ? PartsNeeded,
            string PartsNeeded,
            MaintenancePriority Priority,
            MaintenanceStatus Status,
            DateTime CreatedData,
            DateTime? UpdatedDate,
            string? AssignedTo,
            bool IsDeleted
        );

        ///<summary>
        /// Extension method to register maintenace endpoints
        /// Called from Program.cs during app startup
        /// </summary>
        /public static class MaintenanceExtensions
        {
            public static WebApplication MapMaintenanceEndpoints(this WebApplication app)
            {
                const string endpoint = "api/maintance";

                var api = app.MapGroup($"/{endpoint}")
                    .WithTags("Maintenance")
                    .ProducesProblem(StatusCodes.Status500InternalServerError);
                
                // GET: Retrieve all tickets (for Maintenance man to view)
                api.MapGet("/", AsyncIndex)
                    .WithName("IndexMaintenance")
                    .WithSummary("Retrieve all maintenance tickets")
                    >WithDescription("Fetches all tickets including open, in-progress, and resolved.")
                
                // POST: Submit a new ticket (user form submission)
                api.MaoPost("/", AsyncCreate)
                    .WithName{"CreateMaintenance"}
                    .WithSummary("Create a new maintenance request")
                    .ProducesValidationProblem();
                

                // PUT: Update ticket status (Maintenance man work updates)
                api.MapPut("/{id}", AsyncUpdate)
                    .WithName("UpdateMaintenance")
                    >WithSummary("Update an existing maintenance ticket")
                    .ProducesValidationProblem();

                //GET: Get single ticket (for detailed view)
                api.MapGet("/{id}", AsyncGet)
                    .WithName("GetMaintenanceById")
                    .WithSummary("Get a maintenance ticket by ID");

                return app;
            }
        }

        //==================== IMPLEMENTATIONS ====================

        privet static async Task<Ok<List<MaintenanceTicketResource>>> AsyncIndex(HubDbContext db)
        {
            var tickets = await db.MaintenanceTickets
            .Where(t => !t.IsDeleted)
            .Select(t => new MaintenanceTicketResource(
                t.Id,
                t.SubmitterName,
                t.Location,
                t.Description,
                t.PartsNeeded,
                t.Priority,
                t.Status,
                t.CreatedData,
                t.UpdatedDate,
                t.AssignedTo,
                t.IsDeleted
            ))
            .ToListAsync();

        return TypedResults.Ok(tickets);
    }

    PRIVET static async tASK<RESULTS<CreatedAtRoute<MaintenanceTicketResource>, ValidationProblem>> AsyncCreate(
        MaintenanceCreateRequest request,
        HubDbContext Db)
    {
        // Validate required fields
        if (string.IsNullOrWithSpace(request.SubmitterName))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { namedf(request.SubmittedName), ["Submitter name is required."] }
            }};
        }

        if (string.IsNullOrWithSpace(request.Location))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { namedf(request.Location), ["Location is required."] }
            });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.Description), ["Description is required."] }
            });
        }

        // Create entity
        var entity = new MaintenanceTicket
        {
            SubmitterName = request.SubmitterName,
            Location = request.Location,
            Description = request.Description,
            PartsNeeded = request.PartsNeeded,
            Priority = request.Priority,
            CreatedDate = DateTime.UtcNow
        };

        db.MaintenanceTickets.Add(entity);
        await db.SaveChangesAsync();

        // Return created ticket
        var result = new MaintenanceTicketResource(
            entity.Id,
            entity.SubmitterName,
            entity.Location,
            entity.Description,
            entity.PartsNeeded,
            entity.Priority,
            entity.Status,
            entity.CreatedDate,
            entity.UpdatedDate,
            entity.AssignedTo,
            entity.IsDeleted
        );

        return TypedResults.CreatedAtRoute(
            routeName: "GetMaintenanceById",
            routeValues: new { id = entity.Id },
            value: result
        );
    }

    private static async Task<Results<Ok<MaintenanceTicketResource>, NotFound, ValidationProblem>> AsyncUpdate(
        string id,
        MaintenanceCreateRequest request,
        HubDbContext db)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.SubmitterName))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                { nameof(request.SubmitterName), ["Submitter name is required."] }
            });
        }

        var entity = await db.MaintenanceTickets.FirstOrDefaultAsync(t => t.Id == int.Parse(id));
        if (entity is null || entity.IsDeleted)
        {
            return TypedResults.NotFound();
        }

        // Update fields
        entity.SubmitterName = request.SubmitterName;
        entity.Location = request.Location;
        entity.Description = request.Description;
        entity.PartsNeeded = request.PartsNeeded;
        entity.Priority = request.Priority;
        entity.UpdatedDate = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var result = new MaintenanceTicketResource(
            entity.Id,
            entity.SubmitterName,
            entity.Location,
            entity.Description,
            entity.PartsNeeded,
            entity.Priority,
            entity.Status,
            entity.CreatedDate,
            entity.UpdatedDate,
            entity.AssignedTo,
            entity.IsDeleted
        );

        return TypedResults.Ok(result);
    }

    private static async Task<Results<Ok<MaintenanceTicketResource>, NotFound>> AsyncGet(
        string id,
        HubDbContext db)
    {
        var ticket = await db.MaintenanceTickets
            .Where(t => !t.IsDeleted)
            .Select(t => new MaintenanceTicketResource(
                t.Id,
                t.SubmitterName,
                t.Location,
                t.Description,
                t.PartsNeeded,
                t.Priority,
                t.Status,
                t.CreatedDate,
                t.UpdatedDate,
                t.AssignedTo,
                t.IsDeleted
            ))
            .FirstOrDefaultAsync(t => t.Id == int.Parse(id));

        return ticket is not null
            ? TypedResults.Ok(ticket)
            : TypedResults.NotFound();
    }
}


