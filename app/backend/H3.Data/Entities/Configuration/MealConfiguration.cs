using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace H3.Data.Entities.Configuration;

public class MealConfiguration : IEntityTypeConfiguration<Meal>
{
    public void Configure(EntityTypeBuilder<Meal> builder)
    {
        builder.ToTable("Meals");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasMaxLength(50);

        builder.Property(m => m.MealTime)
            .IsRequired();

        builder.HasOne(m => m.Kennyism)
            .WithMany()
            .HasForeignKey(m => m.KennyismId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(m => m.Items)
            .WithMany()
            .UsingEntity(j => j.ToTable("MealMenuItems"));
    }
}