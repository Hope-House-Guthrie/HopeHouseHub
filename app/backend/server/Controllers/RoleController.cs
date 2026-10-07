using System;
using System.Collections.Generic;
using System.Linq;
using H3.Data.Enums;
using H3.Data.Extensions;
using H3.Server.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace H3.Server.Controllers;

[ApiController]
[Route("api/role")]
[Authorize(Roles = "ADMIN")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class RoleController : ControllerBase
{
    /// <summary>
    /// Retrieve all roles with display names and normalized names
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<RoleResource>), StatusCodes.Status200OK)]
    public ActionResult<List<RoleResource>> Index()
    {
        var roles = Enum.GetValues<SystemRole>()
            .Select(role =>
            {
                var attr = role.GetAttribute<SystemRoleAttribute>();
                return new RoleResource(
                    (int)role,
                    role.ToString(),
                    attr?.Name ?? role.ToString(),
                    attr?.NormalizedName ?? role.ToString().ToUpperInvariant()
                );
            })
            .ToList();

        return Ok(roles);
    }
}