using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClientInquiryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_Email",
                table: "ClientInquiries",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_IsArchived_DateOfBirth",
                table: "ClientInquiries",
                columns: new[] { "IsArchived", "DateOfBirth" });

            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_IsArchived_FirstName",
                table: "ClientInquiries",
                columns: new[] { "IsArchived", "FirstName" });

            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_IsArchived_LastName",
                table: "ClientInquiries",
                columns: new[] { "IsArchived", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_IsArchived_Timestamp",
                table: "ClientInquiries",
                columns: new[] { "IsArchived", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_ClientInquiries_Phone",
                table: "ClientInquiries",
                column: "Phone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_Email",
                table: "ClientInquiries");

            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_IsArchived_DateOfBirth",
                table: "ClientInquiries");

            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_IsArchived_FirstName",
                table: "ClientInquiries");

            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_IsArchived_LastName",
                table: "ClientInquiries");

            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_IsArchived_Timestamp",
                table: "ClientInquiries");

            migrationBuilder.DropIndex(
                name: "IX_ClientInquiries_Phone",
                table: "ClientInquiries");
        }
    }
}
