namespace H3.Server.Resources;

public record UserUpdateResource(
    string Email,
    string FirstName,
    string LastName,
    bool IsActive,
    string[]? RoleNormalizedNames
);