using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace H3.Data.Entities.Configuration;

public class KennyismConfiguration : IEntityTypeConfiguration<Kennyism>
{
    public void Configure(EntityTypeBuilder<Kennyism> builder)
    {
        builder.ToTable("Kennyisms");

        builder.HasKey(k => k.Id);

        builder.Property(k => k.Text)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasIndex(k => k.Text);
    }
}