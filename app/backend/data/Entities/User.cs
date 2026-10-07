using Microsoft.AspNetCore.Identity;

namespace H3.Data.Entities;

public class User : IdentityUser<int>
{
    public bool IsActive { get; set; }
    public bool MustChangePassword { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}
