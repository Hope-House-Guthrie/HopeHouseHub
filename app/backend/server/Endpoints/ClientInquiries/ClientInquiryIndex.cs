using System;

namespace H3.Server.Endpoints.ClientInquiries;

public record ClientInquiryIndex(
    Guid Id,
    string FirstName,
    string LastName,
    DateOnly DateOfBirth,
    string Phone,
    string Email,
    DateTimeOffset Timestamp,
    bool IsArchived
);