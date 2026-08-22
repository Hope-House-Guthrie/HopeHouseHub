using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class PrototypePreviewRoles : Migration
    {
        private const int SuperAdminUserId = 1;

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Name", "NormalizedName", "ConcurrencyStamp" },
                values: new object[,]
                {
                    { 6, "Prototype", "PROTOTYPE", Guid.NewGuid().ToString() },
                    { 7, "Preview", "PREVIEW", Guid.NewGuid().ToString() }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                values: new object[,]
                {
                    { SuperAdminUserId, 6 },
                    { SuperAdminUserId, 7 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "UserId", "RoleId" },
                keyValues: new object[] { SuperAdminUserId, 6 });

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "UserId", "RoleId" },
                keyValues: new object[] { SuperAdminUserId, 7 });

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 7);
        }
    }
}