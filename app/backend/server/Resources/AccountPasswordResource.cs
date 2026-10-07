namespace H3.Server.Resources;

public record AccountPasswordResource(
    string? CurrentPassword,
    string NewPassword
);