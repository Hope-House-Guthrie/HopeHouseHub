using H3.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace H3.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdmins : Migration
    {
        private const int SuperAdminUserId = 1;
        private const string SuperAdminSecurityStamp = "8A7F4B23-9D1E-4C5A-8B3F-2E1D0C9A8B7C";
        private const string SuperAdminConcurrencyStamp = "1D2E3F4A-5B6C-7D8E-9F0A-1B2C3D4E5F6A";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var hasher = new PasswordHasher<User>();
            var passwordHash = hasher.HashPassword(null!, "super.admin");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "Id",
                    "UserName",
                    "NormalizedUserName",
                    "Email",
                    "NormalizedEmail",
                    "EmailConfirmed",
                    "PasswordHash",
                    "SecurityStamp",
                    "ConcurrencyStamp",
                    "PhoneNumberConfirmed",
                    "TwoFactorEnabled",
                    "LockoutEnabled",
                    "AccessFailedCount",
                    "IsActive",
                    "MustChangePassword",
                    "FirstName",
                    "LastName"
                },
                values: new object[]
                {
                    SuperAdminUserId,
                    "super.admin",
                    "SUPER.ADMIN",
                    "super.admin@h3.local",
                    "SUPER.ADMIN@H3.LOCAL",
                    true,
                    passwordHash,
                    SuperAdminSecurityStamp,
                    SuperAdminConcurrencyStamp,
                    false,
                    false,
                    true,
                    0,
                    true,
                    true,
                    "Super",
                    "Admin"
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                values: new object[,]
                {
                    { SuperAdminUserId, 1 },
                    { SuperAdminUserId, 2 },
                    { SuperAdminUserId, 3 },
                    { SuperAdminUserId, 4 },
                    { SuperAdminUserId, 5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            for (var roleId = 1; roleId <= 5; roleId++)
            {
                migrationBuilder.DeleteData(
                    table: "UserRoles",
                    keyColumns: new[] { "UserId", "RoleId" },
                    keyValues: new object[] { SuperAdminUserId, roleId });
            }

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: SuperAdminUserId);
        }
    }
}