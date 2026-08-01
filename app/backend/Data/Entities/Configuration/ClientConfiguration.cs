using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace H3.Data.Entities.Configuration;

public class ClientConfiguration 
    : IEntityTypeConfiguration<Client>
{
    public void Configure(
        EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("clients");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id");

        builder.Property(c => c.FirstName)
            .HasColumnName("first_name")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.MiddleName)
            .HasColumnName("middle_name")
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .HasColumnName("last_name")
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.CreateDate)
            .HasColumnName("create_date")
            .IsRequired();

        builder.Property(c => c.UpdateDate)
            .HasColumnName("update_date");

        builder.Property(c => c.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(c => c.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
