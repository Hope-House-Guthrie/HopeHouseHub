//============================================================
//MaintenanceTicket Entity
//Purpos: Maintenance Database entity for maintiance requests
//Used by: Frontend forms to submit tickets
//         Maintenance Man to view and update ticket status 
//============================================================

namesapce H3.Data.Entities

///<summery>
/// Priority levels for maintenance request
/// </summery>
public enum MaintenancePriority
{
    Low = 1,             // Minor issue, can wait.
    Medium = 2,         // Needs attention soon
    High = 3,          // Urgent, affects functionality
    Emergency = 4     // Safety hazard or complete failure
}

///<summary?
/// Status tracking for maintenance tickets
/// </summary>
public enum MaintenanceStatus
{
    Open = 1,               // Newe ticket, not yet assigned
    Inprogress = 2,        // Maintenance man working on it
    Resolved = 3,         // Fixed and verified
    Closed = 4           // Maintenance man signed off as completed
}

///<summary>
/// Maintenance ticket entity
/// Represents a maintenance request submitted by residents/staff
/// Maps to MaintenanceTickets database table
/// </summary>
public record MaintenanceTicket
{
    //Primary key - auto-generate by database
    public int Id { get; set; }

    //Required feilds - user must fill these
    public required string SubmittedName { get; set; }   // Who submitted it
    public required string Location { get; set; }       // Where the issue is
    public required string Description { get; set; }   // What's broken/needs fixing

    // Optional field with defult value
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;

    // Status tracking (starts as Open, changes as Maintenance man works it)
    public MaintenanceStatus status { get; set; } = MaintenanceStatus.Open;

    // Timestamps
    public DateTime CreatedData { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }  // Set when staus changes

    // For Maintenance man workspace tracking
    public string? AssignedTo { get; set; }    // Set when Maintenance man claims ticket

    // Soft delete flag (don't actually delete from DB)
    public bool IsDeleted { get; set; } = false; 
}