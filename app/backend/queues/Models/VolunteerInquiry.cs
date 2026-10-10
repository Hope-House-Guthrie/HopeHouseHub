using System;
using System.Collections.Generic;

namespace H3.Queues.Models;

public record VolunteerInquiry(
    DateTimeOffset Timestamp,
    string SuccessUrl,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string VolunteerType,
    string? Organization,
    IReadOnlyList<string> Interests,
    string? Availability,
    string? Message
);