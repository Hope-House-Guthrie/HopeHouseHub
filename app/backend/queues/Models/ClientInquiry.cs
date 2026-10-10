using System;

namespace H3.Queues.Models;

public record ClientInquiry(
    DateTimeOffset Timestamp,
    string SuccessUrl,
    string FirstName,
    string? MiddleName,
    string LastName,
    string? Suffix,
    DateOnly? DateOfBirth,
    string? Phone,
    string? Email,
    string ContactMethod,
    string HouseholdType,
    int Children,
    string ShelterTiming,
    string VaccinationWillingness,
    string? Message
);
