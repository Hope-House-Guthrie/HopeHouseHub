using System.Collections.Generic;

namespace H3.Server.Resources;

public record UserResource(
    string Id,
    bool IsActive,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> RoleNormalizedNames,
    string? TemporaryPassword = null);