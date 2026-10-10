using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace H3.Data.Entities.Configurations;

public class VolunteerInquiryConfiguration : IEntityTypeConfiguration<VolunteerInquiry>
{
    public void Configure(EntityTypeBuilder<VolunteerInquiry> builder)
    {
        builder.ToTable("VolunteerInquiries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(e => e.Phone)
            .HasMaxLength(14);

        builder.Property(e => e.VolunteerType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Organization)
            .HasMaxLength(150);

        builder.Property(e => e.Interests)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>(),
                new ValueComparer<List<string>>(
                    (c1, c2) => SequenceEqual(c1, c2),
                    c => AggregateHashCode(c),
                    c => c == null ? new List<string>() : new List<string>(c)
                )
            );

        builder.Property(e => e.Availability)
            .HasMaxLength(1000);

        builder.Property(e => e.Message)
            .HasMaxLength(2000);

        builder.Property(e => e.Timestamp)
            .IsRequired();
    }

    private static bool SequenceEqual(List<string>? first, List<string>? second)
    {
        if (ReferenceEquals(first, second)) return true;
        if (first is null || second is null) return false;
        return System.Linq.Enumerable.SequenceEqual(first, second);
    }

    private static int AggregateHashCode(List<string>? list)
    {
        if (list is null) return 0;
        var hash = new HashCode();
        foreach (var item in list)
        {
            hash.Add(item);
        }
        return hash.ToHashCode();
    }
}