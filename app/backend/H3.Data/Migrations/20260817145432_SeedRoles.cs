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
        var roleData = Enum.GetValues<SystemRole>()
            .Select(role =>
            {
                var attr = role.GetAttribute<SystemRoleAttribute>();
                return new object[]
                {
                    (int)role,
                    attr?.Name ?? role.ToString(),
                    attr?.NormalizedName ?? role.ToString().ToUpperInvariant(),
                    Guid.NewGuid().ToString()
                };
            })
            .ToArray();

        var valuesMatrix = new object[roleData.Length, 4];
        for (var i = 0; i < roleData.Length; i++)
        {
            for (var j = 0; j < 4; j++)
            {
                valuesMatrix[i, j] = roleData[i][j];
            }
        }

        migrationBuilder.InsertData(
            table: "Roles",
            columns: ["Id", "Name", "NormalizedName", "ConcurrencyStamp"],
            values: valuesMatrix);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DELETE FROM [Roles]");
    }
}