using System;

namespace H3.Server.Endpoints.VolunteerInquiries;

public record VolunteerInquiryIndex(
    Guid Id,
    string FirstName,
    string LastName,
    string Phone,
    string Email,
    DateTimeOffset Timestamp,
    bool IsArchived
);