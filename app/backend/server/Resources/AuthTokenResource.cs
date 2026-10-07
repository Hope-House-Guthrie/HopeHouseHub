using System.Collections.Generic;

namespace H3.Server.Resources;

public record AuthTokenResource(
    string Token,
    string FirstName,
    string LastName,
    string Email,
    bool MustChangePassword,
    IReadOnlyCollection<string> Roles
);