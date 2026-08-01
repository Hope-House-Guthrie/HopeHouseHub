namespace H3.Data.Entities;

public record User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateTime CreateDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdateDate { get; set; }
    public bool IsActive { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
}