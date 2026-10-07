namespace H3.Server.Resources;

public record UserCreateResource(
    string Email,
    string FirstName,
    string LastName,
    string[]? RoleNormalizedNames
);