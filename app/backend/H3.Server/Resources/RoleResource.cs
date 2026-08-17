namespace H3.Server.Resources;

public record RoleResource(
    int Id,
    string Key,
    string Name,
    string NormalizedName
);