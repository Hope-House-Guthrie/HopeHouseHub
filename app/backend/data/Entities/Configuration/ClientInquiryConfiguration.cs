using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace H3.Data.Entities.Configurations;

public class ClientInquiryConfiguration : IEntityTypeConfiguration<ClientInquiry>
{
    public void Configure(EntityTypeBuilder<ClientInquiry> builder)
    {
        builder.ToTable("ClientInquiries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.MiddleName)
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Suffix)
            .HasMaxLength(5);

        builder.Property(e => e.Phone)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ContactMethod)
            .IsRequired()
            .HasMaxLength(15);

        builder.Property(e => e.HouseholdType)
            .IsRequired()
            .HasMaxLength(15);

        builder.Property(e => e.Children)
            .IsRequired();

        builder.Property(e => e.ShelterTiming)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.VaccinationWillingness)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Message)
            .HasMaxLength(2000);

        builder.Property(e => e.Timestamp)
            .IsRequired();
    }
}