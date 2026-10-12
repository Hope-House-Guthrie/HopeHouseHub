using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class InquiriesArchive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "VolunteerInquiries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "ClientInquiries",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "VolunteerInquiries");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "ClientInquiries");
        }
    }
}
