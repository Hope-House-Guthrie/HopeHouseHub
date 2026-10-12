using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace H3.Data.Entities.Configuration;

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

        builder.HasIndex(e => new { e.IsArchived, e.Timestamp })
            .HasDatabaseName("IX_ClientInquiries_IsArchived_Timestamp");

        builder.HasIndex(e => new { e.IsArchived, e.FirstName })
            .HasDatabaseName("IX_ClientInquiries_IsArchived_FirstName");

        builder.HasIndex(e => new { e.IsArchived, e.LastName })
            .HasDatabaseName("IX_ClientInquiries_IsArchived_LastName");

        builder.HasIndex(e => new { e.IsArchived, e.DateOfBirth })
            .HasDatabaseName("IX_ClientInquiries_IsArchived_DateOfBirth");

        builder.HasIndex(e => e.Email)
            .HasDatabaseName("IX_ClientInquiries_Email");

        builder.HasIndex(e => e.Phone)
            .HasDatabaseName("IX_ClientInquiries_Phone");
    }
}