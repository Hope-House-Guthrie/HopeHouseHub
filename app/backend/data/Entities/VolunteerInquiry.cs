using System;
using System.Collections.Generic;

namespace H3.Data.Entities;

public class VolunteerInquiry
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string VolunteerType { get; set; } = string.Empty;
    public string? Organization { get; set; }
    public List<string> Interests { get; set; } = [];
    public string? Availability { get; set; }
    public string? Message { get; set; }
    public DateTimeOffset Timestamp { get; set; }
}