using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class VolunteerInquiryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_VolunteerInquiries_Email",
                table: "VolunteerInquiries",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerInquiries_IsArchived_FirstName",
                table: "VolunteerInquiries",
                columns: new[] { "IsArchived", "FirstName" });

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerInquiries_IsArchived_LastName",
                table: "VolunteerInquiries",
                columns: new[] { "IsArchived", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerInquiries_IsArchived_Timestamp",
                table: "VolunteerInquiries",
                columns: new[] { "IsArchived", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerInquiries_Phone",
                table: "VolunteerInquiries",
                column: "Phone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VolunteerInquiries_Email",
                table: "VolunteerInquiries");

            migrationBuilder.DropIndex(
                name: "IX_VolunteerInquiries_IsArchived_FirstName",
                table: "VolunteerInquiries");

            migrationBuilder.DropIndex(
                name: "IX_VolunteerInquiries_IsArchived_LastName",
                table: "VolunteerInquiries");

            migrationBuilder.DropIndex(
                name: "IX_VolunteerInquiries_IsArchived_Timestamp",
                table: "VolunteerInquiries");

            migrationBuilder.DropIndex(
                name: "IX_VolunteerInquiries_Phone",
                table: "VolunteerInquiries");
        }
    }
}
