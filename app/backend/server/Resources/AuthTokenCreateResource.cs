namespace H3.Server.Resources;

public record AuthTokenCreateResource(
    string Email, 
    string Password);