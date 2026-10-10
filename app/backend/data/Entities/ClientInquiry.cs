using System;

namespace H3.Data.Entities;

public class ClientInquiry
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Suffix { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string ContactMethod { get; set; } = string.Empty;
    public string HouseholdType { get; set; } = string.Empty;
    public int Children { get; set; }
    public string ShelterTiming { get; set; } = string.Empty;
    public string VaccinationWillingness { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTimeOffset Timestamp { get; set; }
}