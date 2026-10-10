using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class FormInquiries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientInquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Suffix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Phone = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ContactMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HouseholdType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Children = table.Column<int>(type: "integer", nullable: false),
                    ShelterTiming = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    VaccinationWillingness = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientInquiries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerInquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: true),
                    VolunteerType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Organization = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Interests = table.Column<string>(type: "text", nullable: false),
                    Availability = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Timestamp = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerInquiries", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientInquiries");

            migrationBuilder.DropTable(
                name: "VolunteerInquiries");
        }
    }
}
