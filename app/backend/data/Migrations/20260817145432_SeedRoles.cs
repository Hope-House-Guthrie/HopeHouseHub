using System;
using System.Linq;
using H3.Data.Enums;
using H3.Data.Extensions;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace H3.Data.Migrations;

public partial class SeedRoles : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.InsertData(
            table: "Roles",
            columns: new[] { "Id", "Name", "NormalizedName", "ConcurrencyStamp" },
            values: new object[,]
            {
                { 1, "Admin Staff", "ADMIN", Guid.NewGuid().ToString() },
                { 2, "Client", "CLIENT", Guid.NewGuid().ToString() },
                { 3, "Kitchen Staff", "KITCHEN", Guid.NewGuid().ToString() },
                { 4, "House Leader", "LEADER", Guid.NewGuid().ToString() },
                { 5, "Board Member", "BOARD", Guid.NewGuid().ToString() }
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DELETE FROM [Roles]");
    }
}